
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
  
  containers.forEach(container => {
    if (container) {
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
      } 
      // Si hay una configuración específica para este widget
      else if (window.historiasMemorableQRConfig && window.historiasMemorableQRConfig[containerId]) {
        config = window.historiasMemorableQRConfig[containerId];
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
      }
      
      // Sobreescribir con atributos específicos del contenedor si existen
      if (mainTitle) config.texts.mainTitle = mainTitle;
      if (title) config.texts.title = title;
      if (publishedStoriesTitle) config.texts.publishedStoriesTitle = publishedStoriesTitle;
      
      try {
        // Renderizar el componente React en el contenedor
        const root = createRoot(container);
        root.render(
          <React.StrictMode>
            <WordPressEmbed config={config} />
          </React.StrictMode>
        );
        console.log(`Widget inicializado correctamente en ${containerId}`);
      } catch (error) {
        console.error(`Error al inicializar widget en ${containerId}:`, error);
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
}

