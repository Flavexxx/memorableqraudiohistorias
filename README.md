
# Grabador de Audio para WordPress Elementor

Este proyecto proporciona un widget de grabación de audio estilo WhatsApp que se puede integrar fácilmente en sitios WordPress que utilicen Elementor.

## Características

- 🎙️ Grabación de audio desde el micrófono del dispositivo
- ▶️ Reproducción del audio grabado para previsualización
- 🔄 Opción para volver a grabar el mensaje
- 📊 Visualización gráfica de la onda de audio
- 📱 Diseño responsive para móviles y escritorio
- 🔌 Fácil integración con WordPress

## Guía de Integración

### Opción 1: Como Plugin de WordPress (Recomendado)

1. Compila este proyecto con `npm run build`
2. Crea un plugin WordPress básico con el siguiente código:

```php
<?php
/*
Plugin Name: Grabador de Audio para WordPress
Description: Widget de grabación de audio estilo WhatsApp para sitios WordPress
Version: 1.0
*/

// Registrar scripts y estilos
function audio_recorder_enqueue_scripts() {
    wp_enqueue_style('audio-recorder-css', plugin_dir_url(__FILE__) . 'dist/assets/index.css');
    wp_enqueue_script('audio-recorder-js', plugin_dir_url(__FILE__) . 'dist/assets/index.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'audio_recorder_enqueue_scripts');

// Registrar shortcode
function audio_recorder_shortcode() {
    return '<div id="audio-recorder-root" class="wp-audio-recorder"></div>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            // Inicializar el componente en el div
            const root = document.getElementById("audio-recorder-root");
            if (root) {
                // El script de inicialización dependerá de cómo hayas compilado la aplicación
            }
        });
    </script>';
}
add_shortcode('audio_recorder', 'audio_recorder_shortcode');

// Manejar la subida de archivos de audio
function handle_audio_upload() {
    // Verificar permisos y nonce para seguridad
    
    $upload_dir = wp_upload_dir();
    $audio_dir = $upload_dir['basedir'] . '/audio-recordings';
    
    if (!file_exists($audio_dir)) {
        wp_mkdir_p($audio_dir);
    }
    
    $file_name = 'recording_' . time() . '.webm';
    $file_path = $audio_dir . '/' . $file_name;
    
    if (move_uploaded_file($_FILES['audio_file']['tmp_name'], $file_path)) {
        $file_url = $upload_dir['baseurl'] . '/audio-recordings/' . $file_name;
        
        wp_send_json_success(array(
            'file_url' => $file_url
        ));
    } else {
        wp_send_json_error(array(
            'message' => 'Error al guardar el archivo'
        ));
    }
    
    wp_die();
}
add_action('wp_ajax_upload_audio_recording', 'handle_audio_upload');
add_action('wp_ajax_nopriv_upload_audio_recording', 'handle_audio_upload');
?>
```

3. Copia los archivos compilados de la carpeta `dist` a tu plugin
4. Sube el plugin a tu sitio WordPress
5. Usa el shortcode `[audio_recorder]` en cualquier página o post

### Opción 2: Como Bloque HTML en Elementor

1. En Elementor, añade un widget de HTML personalizado
2. Pega el siguiente código:

```html
<div id="audio-recorder-embed"></div>
<link rel="stylesheet" href="URL_A_TU_CSS">
<script src="URL_A_TU_JS"></script>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        // Inicializar el componente
        const rootElement = document.getElementById("audio-recorder-embed");
        // El código de inicialización dependerá de cómo hayas compilado la aplicación
    });
</script>
```

3. Reemplaza "URL_A_TU_CSS" y "URL_A_TU_JS" con las URLs a tus archivos compilados
4. Guarda y publica la página

## Personalización

Puedes personalizar la apariencia y comportamiento del grabador:

- **Colores**: Modifica las clases de Tailwind en `AudioRecorder.tsx`
- **Comportamiento**: Ajusta las funciones en `handleAudioPublished`
- **Formato de audio**: Cambia el tipo MIME en `startRecording` (por defecto es webm)

## Requisitos técnicos

- El navegador debe tener permisos para acceder al micrófono
- Se recomienda usar HTTPS para poder acceder al micrófono
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)

## Soporte y contribuciones

Para reportar problemas o contribuir al desarrollo, por favor [abre un issue](https://github.com/tu-usuario/tu-repo/issues).

---

Desarrollado con React, TypeScript y Tailwind CSS.
