
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Asegurarse de que el elemento root está vacío antes de renderizar
const rootElement = document.getElementById("root");
if (rootElement) {
  // Limpiar el contenedor antes de renderizar para evitar error #299
  rootElement.innerHTML = '';
  
  // Crear root y renderizar App
  createRoot(rootElement).render(<App />);
}
