
import React from 'react';
import ReactDOM from 'react-dom';
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
      
      // Configuración personalizada basada en atributos
      const config = {
        texts: {
          mainTitle,
          title,
          publishedStoriesTitle,
        },
        styles: {
          // Estilos por defecto, se pueden personalizar más adelante
        }
      };
      
      // Renderizar el componente React en el contenedor
      ReactDOM.createRoot(container).render(
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
  ReactDOM.createRoot(document.getElementById('root')!).render(
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
