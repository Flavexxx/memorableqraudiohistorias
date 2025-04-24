
import React from 'react';
import { createRoot } from 'react-dom/client';
import WordPressEmbed from './components/WordPressEmbed';
import './index.css';

// Función para inicializar el widget cuando el DOM esté listo
function initializeWidget() {
  // Buscar todos los contenedores del widget
  const containers = document.querySelectorAll('#historias-memorableqr-widget');
  
  containers.forEach(container => {
    if (container) {
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
      // Si hay una configuración directa en el elemento (usada en el shortcode)
      else if (window.audioRecorderConfig) {
        config = window.audioRecorderConfig;
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
      
      // Renderizar el componente React en el contenedor
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <WordPressEmbed config={config} />
        </React.StrictMode>
      );
    }
  });
}

// Detectar si estamos en un entorno de desarrollo o WordPress
if (document.getElementById('root')) {
  // Modo desarrollo - renderizamos en el div 'root'
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <WordPressEmbed />
    </React.StrictMode>
  );
} else {
  // En WordPress - esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }
}
