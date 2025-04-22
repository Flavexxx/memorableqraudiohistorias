
# Instrucciones para compilar y crear el Plugin WordPress

## 1. Preparación del entorno

### Requisitos previos
- [Node.js](https://nodejs.org/es/) (versión 14 o superior)
- npm (viene con Node.js)
- Un editor de código como Visual Studio Code (opcional)

## 2. Compilación del proyecto React

1. Descarga todos los archivos del proyecto a una carpeta en tu computadora.

2. Abre una terminal (Símbolo del sistema en Windows, Terminal en Mac/Linux) y navega hasta la carpeta del proyecto:
   ```bash
   cd ruta/a/tu/proyecto
   ```

3. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

4. Compila el proyecto para producción:
   ```bash
   npm run build
   ```

5. Después de ejecutar este comando, se creará una carpeta llamada `dist` con los archivos compilados.

## 3. Creación del plugin WordPress

1. Crea una nueva carpeta llamada `historias-memorableqr` en tu computadora.

2. Dentro de esta carpeta, crea la siguiente estructura:
   ```
   historias-memorableqr/
   ├── assets/
   │   ├── js/
   │   └── css/
   ├── historias-memorableqr.php
   └── readme.txt
   ```

3. Copia los archivos:
   - De la carpeta `dist/assets/` copia el archivo JavaScript (típicamente `index-[hash].js`) a `historias-memorableqr/assets/js/index.js`
   - De la carpeta `dist/assets/` copia el archivo CSS (típicamente `index-[hash].css`) a `historias-memorableqr/assets/css/index.css`
   - Copia el contenido de `historias-memorableqr.php` a tu nueva carpeta.
   - Copia el contenido de `readme.txt` a tu nueva carpeta.

4. Comprime la carpeta `historias-memorableqr` en un archivo ZIP:
   - En Windows: Clic derecho > Enviar a > Carpeta comprimida
   - En Mac: Clic derecho > Comprimir
   - En terminal: `zip -r historias-memorableqr.zip historias-memorableqr`

## 4. Instalación en WordPress

1. Accede al panel de administración de WordPress.
2. Ve a Plugins > Añadir nuevo > Subir plugin.
3. Selecciona el archivo ZIP que creaste y haz clic en "Instalar ahora".
4. Activa el plugin después de que se haya instalado.
5. Usa el shortcode `[historias_memorableqr]` en cualquier página o entrada.

## Solución de problemas

Si encuentras errores durante la compilación o instalación:

1. Verifica que tienes la versión correcta de Node.js instalada.
2. Asegúrate de que la estructura de carpetas es exactamente como se indica.
3. Comprueba que los archivos PHP están codificados correctamente y no contienen errores sintácticos.
