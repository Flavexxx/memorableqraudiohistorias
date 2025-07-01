
import React from 'react';
import { createRoot } from 'react-dom/client';
import WordPressWidget from './components/WordPressWidget';
import './wordpress-styles.css';

declare global {
  interface Window {
    initializeHistoriasMemorableQR: () => void;
  }
}

window.initializeHistoriasMemorableQR = function() {
  try {
    console.log('[HistoriasMemorableQR] Inicializando widgets...');
    
    const containers = document.querySelectorAll('.historias-memorableqr-widget');
    console.log(`[HistoriasMemorableQR] Encontrados ${containers.length} contenedores`);
    
    containers.forEach(container => {
      try {
        const containerId = container.id || 'widget-' + Math.random().toString(36).substring(2, 9);
        console.log(`[HistoriasMemorableQR] Inicializando widget: ${containerId}`);
        
        container.innerHTML = '';
        const root = createRoot(container);
        root.render(<WordPressWidget />);
        
        console.log(`[HistoriasMemorableQR] Widget inicializado: ${containerId}`);
      } catch (error) {
        console.error(`[HistoriasMemorableQR] Error en widget:`, error);
        container.innerHTML = `<div class="hmqr-error">Error al cargar el grabador: ${error.message}</div>`;
      }
    });
  } catch (error) {
    console.error("[HistoriasMemorableQR] Error global:", error);
  }
};

if (document.getElementById('root')) {
  console.log('[HistoriasMemorableQR] Modo desarrollo');
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<WordPressWidget />);
  }
}
