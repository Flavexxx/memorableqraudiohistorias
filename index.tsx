
import React from 'react';
import { createRoot } from 'react-dom/client';
import WordPressEmbed from './components/WordPressEmbed';
import './index.css';

// Función para inicializar el widget cuando el DOM esté listo
// Esta función estará disponible globalmente para WordPress
window.initializeHistoriasMemorableQR = function() {
  console.log('Buscando contenedores de Historias MemorableQR...');
  
  // Buscar todos los contenedores del widget por clase
  const containers = document.querySelectorAll('.historias-memorableqr-widget');
  console.log(`Encontrados ${containers.length} contenedores de widgets`);
  
  if (containers.length === 0) {
    console.error('No se encontraron contenedores de widgets con la clase .historias-memorableqr-widget');
    return;
  }
  
  containers.forEach(container => {
    if (container) {
      try {
        // Obtener el ID único del contenedor
        const containerId = container.id;
        console.log(`Inicializando widget en: ${containerId}`);
        
        // Obtener atributos de datos del contenedor
        const mainTitle = container.getAttribute('data-main-title') || undefined;
        const title = container.getAttribute('data-title') || undefined;
        const publishedStoriesTitle = container.getAttribute('data-published-stories-title') || undefined;
        
        // Configuración personalizada basada en atributos o config global
        let config = {};
        
        // Si hay una configuración global de WordPress (pasada por wp_localize_script)
        if (window.historiasMemorableQR && window.historiasMemorableQR.config) {
          config = window.historiasMemorableQR.config;
          console.log('Usando configuración global:', config);
        } 
        // Si hay una configuración específica para este widget
        else if (window.historiasMemorableQRConfig && window.historiasMemorableQRConfig[containerId]) {
          config = window.historiasMemorableQRConfig[containerId];
          console.log('Usando configuración específica para:', containerId, config);
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
          console.log('Usando configuración por defecto');
        }
        
        // Sobreescribir con atributos específicos del contenedor si existen
        if (mainTitle) config.texts.mainTitle = mainTitle;
        if (title) config.texts.title = title;
        if (publishedStoriesTitle) config.texts.publishedStoriesTitle = publishedStoriesTitle;
        
        // Limpiar contenido del contenedor (eliminar mensaje de carga)
        container.innerHTML = '';
        
        // Renderizar el componente React en el contenedor
        const root = createRoot(container);
        root.render(
          <React.StrictMode>
            <WordPressEmbed config={config} />
          </React.StrictMode>
        );
        console.log(`Widget inicializado correctamente en ${containerId}`);
      } catch (error) {
        console.error(`Error al inicializar widget:`, error);
        // Mostrar mensaje de error en el contenedor
        container.innerHTML = '<div style="color: red;">Error al cargar el grabador de audio. Por favor, revisa la consola.</div>';
      }
    }
  });
};

// Detectar si estamos en un entorno de desarrollo o WordPress
if (document.getElementById('root')) {
  // Modo desarrollo - renderizamos en el div 'root'
  console.log('Modo desarrollo: renderizando en #root');
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <WordPressEmbed />
    </React.StrictMode>
  );
} else {
  // En WordPress - esperar a que el DOM esté listo
  console.log('Modo WordPress: esperando a que initializeHistoriasMemorableQR sea llamado');
  
  // Inicialización automática como respaldo
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded triggered - verificando si initializeHistoriasMemorableQR ya se ejecutó');
    setTimeout(function() {
      const containers = document.querySelectorAll('.historias-memorableqr-widget');
      if (containers.length > 0 && containers[0].querySelector('.loading-indicator')) {
        console.log('Detectados widgets sin inicializar, ejecutando inicialización de respaldo...');
        if (typeof window.initializeHistoriasMemorableQR === 'function') {
          window.initializeHistoriasMemorableQR();
        }
      }
    }, 1000); // Dar tiempo para que WordPress ejecute su inicialización primero
  });
}
