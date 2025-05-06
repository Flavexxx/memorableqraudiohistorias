
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Función para manejar errores de forma segura durante la inicialización
function safeInitializeApp() {
  try {
    // Asegurarse de que el elemento root está vacío antes de renderizar
    const rootElement = document.getElementById("root");
    if (rootElement) {
      // Limpiar el contenedor antes de renderizar para evitar error #299
      rootElement.innerHTML = '';
      
      // Crear root y renderizar App
      const root = createRoot(rootElement);
      root.render(<App />);
      console.log("Aplicación React inicializada correctamente");
    } else {
      console.warn("Elemento root no encontrado en el DOM");
    }
  } catch (error) {
    console.error("Error al inicializar la aplicación React:", error);
  }
}

// Inicializar cuando el DOM esté completamente cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInitializeApp);
} else {
  // Si el DOM ya está cargado, inicializar inmediatamente
  safeInitializeApp();
}
