
import React from 'react';
import { createRoot } from 'react-dom/client';
import WordPressEmbed from './src/components/WordPressEmbed';
import './src/index.css';

// IMPORTANTE: Declaración explícita de la función de inicialización en el ámbito global
// Esta es la función que WordPress intentará llamar
window.initializeHistoriasMemorableQR = function() {
  try {
    console.log('[HistoriasMemorableQR] Inicializando widgets...');
    
    // Buscar todos los contenedores del widget por clase
    const containers = document.querySelectorAll('.historias-memorableqr-widget');
    console.log(`[HistoriasMemorableQR] Encontrados ${containers.length} contenedores de widgets`);
    
    if (containers.length === 0) {
      console.warn('[HistoriasMemorableQR] No se encontraron contenedores de widgets');
      return;
    }
    
    containers.forEach(container => {
      try {
        // Obtener el ID único del contenedor
        const containerId = container.id || 'widget-' + Math.random().toString(36).substring(2, 9);
        console.log(`[HistoriasMemorableQR] Inicializando widget en: ${containerId}`);
        
        // Obtener atributos de datos del contenedor
        const mainTitle = container.getAttribute('data-main-title') || undefined;
        const title = container.getAttribute('data-title') || undefined;
        const publishedStoriesTitle = container.getAttribute('data-published-stories-title') || undefined;
        
        // Configuración personalizada basada en atributos o config global
        let config = {};
        
        // Si hay una configuración global de WordPress
        if (window.historiasMemorableQR && window.historiasMemorableQR.config) {
          config = window.historiasMemorableQR.config;
          console.log('[HistoriasMemorableQR] Usando configuración global');
        } 
        // Si hay una configuración específica para este widget
        else if (window.historiasMemorableQRConfig && window.historiasMemorableQRConfig[containerId]) {
          config = window.historiasMemorableQRConfig[containerId];
          console.log('[HistoriasMemorableQR] Usando configuración específica para:', containerId);
        }
        // Configuración básica
        else {
          config = {
            texts: {
              mainTitle,
              title,
              publishedStoriesTitle,
            },
            styles: {}
          };
          console.log('[HistoriasMemorableQR] Usando configuración por defecto');
        }
        
        // Sobreescribir con atributos específicos del contenedor si existen
        if (mainTitle) config.texts.mainTitle = mainTitle;
        if (title) config.texts.title = title;
        if (publishedStoriesTitle) config.texts.publishedStoriesTitle = publishedStoriesTitle;
        
        // IMPORTANTE: Limpiar completamente el contenido del contenedor antes de renderizar
        container.innerHTML = '';
        
        try {
          // Crear root de forma segura y renderizar
          const root = createRoot(container);
          root.render(<WordPressEmbed config={config} />);
          console.log(`[HistoriasMemorableQR] Widget inicializado correctamente en ${containerId}`);
        } catch (renderError) {
          console.error(`[HistoriasMemorableQR] Error al renderizar el componente:`, renderError);
          container.innerHTML = `<div class="historias-memorableqr-error">
            <p><strong>Error al renderizar el componente</strong></p>
            <p>Detalles: ${renderError.message || 'Error desconocido'}</p>
          </div>`;
        }
      } catch (error) {
        console.error(`[HistoriasMemorableQR] Error al inicializar widget:`, error);
        container.innerHTML = '<div class="historias-memorableqr-error">' +
          '<p><strong>Error al cargar el grabador de audio</strong></p>' +
          '<p>Detalles: ' + (error instanceof Error ? error.message : String(error)) + '</p>' +
          '</div>';
      }
    });
  } catch (globalError) {
    console.error("[HistoriasMemorableQR] Error global en la inicialización:", globalError);
  }
};

// Modo desarrollo - renderizamos en el div 'root' si existe
if (document.getElementById('root')) {
  console.log('[HistoriasMemorableQR] Iniciando en modo desarrollo...');
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    try {
      rootElement.innerHTML = '';
      const root = createRoot(rootElement);
      root.render(<WordPressEmbed />);
      console.log('[HistoriasMemorableQR] Aplicación renderizada en modo desarrollo');
    } catch (error) {
      console.error("[HistoriasMemorableQR] Error al renderizar en modo desarrollo:", error);
    }
  }
}
