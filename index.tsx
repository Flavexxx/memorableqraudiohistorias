
import React from 'react';
import { createRoot } from 'react-dom/client';
import WordPressEmbed from './components/WordPressEmbed';
import './index.css';

// Variable global de debug
declare global {
  interface Window {
    historiasMemorableQR?: {
      config?: any;
      debug?: boolean;
    };
    historiasMemorableQRConfig?: {
      [key: string]: any;
    };
    audioRecorderConfig?: any;
    initializeHistoriasMemorableQR?: () => void;
  }
}

// Función de registro de debug
const debugLog = (message: string, ...args: any[]) => {
  if (window.historiasMemorableQR?.debug) {
    console.log(`[HistoriasMemorableQR] ${message}`, ...args);
  }
};

// Función segura para crear instancia de root
const safeCreateRoot = (container: Element): React.Root => {
  try {
    // Limpiar el contenedor antes para evitar error #299
    container.innerHTML = '';
    return createRoot(container);
  } catch (error) {
    console.error("Error al crear root React:", error);
    // Intentar una vez más después de limpiar
    container.innerHTML = '';
    return createRoot(container);
  }
};

// Función para inicializar el widget cuando el DOM esté listo
// Usamos IIFE para aislar nuestro código del ámbito global de WordPress
(function() {
  // Función de inicialización aislada
  function initializeHistoriasMemorableQRInternal() {
    debugLog('Buscando contenedores de Historias MemorableQR...');
    
    try {
      // Buscar todos los contenedores del widget por clase
      const containers = document.querySelectorAll('.historias-memorableqr-widget');
      debugLog(`Encontrados ${containers.length} contenedores de widgets`);
      
      if (containers.length === 0) {
        console.warn('No se encontraron contenedores de widgets con la clase .historias-memorableqr-widget');
        return;
      }
      
      containers.forEach(container => {
        try {
          // Obtener el ID único del contenedor
          const containerId = container.id;
          debugLog(`Inicializando widget en: ${containerId}`);
          
          // Obtener atributos de datos del contenedor
          const mainTitle = container.getAttribute('data-main-title') || undefined;
          const title = container.getAttribute('data-title') || undefined;
          const publishedStoriesTitle = container.getAttribute('data-published-stories-title') || undefined;
          
          // Configuración personalizada basada en atributos o config global
          let config = {};
          
          // Si hay una configuración global de WordPress (pasada por wp_localize_script)
          if (window.historiasMemorableQR && window.historiasMemorableQR.config) {
            config = window.historiasMemorableQR.config;
            debugLog('Usando configuración global:', config);
          } 
          // Si hay una configuración específica para este widget
          else if (window.historiasMemorableQRConfig && window.historiasMemorableQRConfig[containerId]) {
            config = window.historiasMemorableQRConfig[containerId];
            debugLog('Usando configuración específica para:', containerId, config);
          }
          // Configuración básica
          else {
            config = {
              texts: {
                mainTitle,
                title,
                publishedStoriesTitle,
              },
              styles: {
                // Estilos por defecto
              }
            };
            debugLog('Usando configuración por defecto');
          }
          
          // Sobreescribir con atributos específicos del contenedor si existen
          if (mainTitle) config.texts.mainTitle = mainTitle;
          if (title) config.texts.title = title;
          if (publishedStoriesTitle) config.texts.publishedStoriesTitle = publishedStoriesTitle;
          
          // IMPORTANTE: Limpiar completamente el contenido del contenedor antes de renderizar
          container.innerHTML = '';
          
          try {
            // Renderizar el componente React en el contenedor vacío de forma segura
            const root = safeCreateRoot(container);
            root.render(
              // Quitamos StrictMode para evitar posibles problemas con WordPress
              <WordPressEmbed config={config} />
            );
            debugLog(`Widget inicializado correctamente en ${containerId}`);
          } catch (renderError) {
            console.error(`Error al renderizar el componente React:`, renderError);
            container.innerHTML = `<div class="historias-memorableqr-error">
              <p><strong>Error al renderizar el componente de React</strong></p>
              <p>Detalles: ${renderError.message}</p>
            </div>`;
          }
        } catch (error) {
          console.error(`Error al inicializar widget:`, error);
          // Mostrar mensaje de error en el contenedor
          container.innerHTML = '<div class="historias-memorableqr-error">' +
            '<p><strong>Error al cargar el grabador de audio</strong></p>' +
            '<p>Detalles: ' + (error instanceof Error ? error.message : String(error)) + '</p>' +
            '</div>';
        }
      });
    } catch (globalError) {
      console.error("Error global en la inicialización:", globalError);
    }
  }

  // Exponer la función de inicialización de forma segura
  window.initializeHistoriasMemorableQR = initializeHistoriasMemorableQRInternal;

  // Detectar si estamos en un entorno de desarrollo o WordPress
  if (document.getElementById('root')) {
    // Modo desarrollo - renderizamos en el div 'root'
    debugLog('Modo desarrollo: renderizando en #root');
    const rootElement = document.getElementById('root');
    
    // Asegurarse de que el elemento root está vacío
    if (rootElement) {
      try {
        rootElement.innerHTML = '';
        const root = createRoot(rootElement);
        root.render(<WordPressEmbed />);
      } catch (error) {
        console.error("Error al renderizar en modo desarrollo:", error);
      }
    }
  } else {
    // En WordPress, inicialización manual no es necesaria
    debugLog('Modo WordPress: esperando inicialización manual');
    
    // Auto-ejecutar la inicialización si estamos en un entorno WordPress
    // pero esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        debugLog('DOM cargado, inicializando automáticamente');
        setTimeout(initializeHistoriasMemorableQRInternal, 100);
      });
    } else {
      // Si el DOM ya está cargado, inicializar después de un breve retraso
      // para asegurar que otros scripts de WordPress ya se hayan cargado
      debugLog('DOM ya cargado, inicializando con retraso');
      setTimeout(initializeHistoriasMemorableQRInternal, 100);
    }
  }
})();
