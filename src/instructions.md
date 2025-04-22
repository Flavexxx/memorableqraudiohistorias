
# Instrucciones para Integración en WordPress Elementor

Este componente de grabación de audio está diseñado para ser integrado en un sitio WordPress que utilice Elementor.

## Método de integración

Existen varias formas de integrar este componente en WordPress:

### 1. Como Shortcode (Recomendado)

1. Crea un plugin WordPress sencillo
2. Registra un shortcode (por ejemplo, `[audio_recorder]`)
3. El plugin debe cargar los archivos JS/CSS necesarios y renderizar el componente

Ejemplo de código para el plugin:

```php
<?php
/*
Plugin Name: Audio Recorder Widget
Description: Grabador de audio estilo WhatsApp para WordPress
Version: 1.0
Author: Tu Nombre
*/

// Registrar scripts y estilos
function audio_recorder_enqueue_scripts() {
    wp_enqueue_style('audio-recorder-css', plugin_dir_url(__FILE__) . 'dist/assets/index.css');
    wp_enqueue_script('audio-recorder-js', plugin_dir_url(__FILE__) . 'dist/assets/index.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'audio_recorder_enqueue_scripts');

// Registrar shortcode
function audio_recorder_shortcode() {
    return '<div id="audio-recorder-root"></div>';
}
add_shortcode('audio_recorder', 'audio_recorder_shortcode');

// Manejar subida de archivos de audio
function handle_audio_upload() {
    // Verificar nonce y permisos

    $upload_dir = wp_upload_dir();
    $audio_dir = $upload_dir['basedir'] . '/audio-recordings';
    
    if (!file_exists($audio_dir)) {
        wp_mkdir_p($audio_dir);
    }
    
    $file_name = 'recording_' . time() . '.webm';
    $file_path = $audio_dir . '/' . $file_name;
    
    // Mover archivo subido
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
```

### 2. Como Bloque HTML de Elementor

1. En Elementor, añade un widget HTML
2. Pega el código HTML, CSS y JavaScript compilado
3. Asegúrate de incluir también las dependencias

## Compilación para WordPress

Para compilar este proyecto para WordPress:

1. Ejecuta `npm run build`
2. Los archivos compilados estarán en la carpeta `dist`
3. Copia estos archivos a tu plugin de WordPress

## Seguridad y Consideraciones

- Implementa validación de usuarios antes de permitir grabaciones
- Establece límites de tamaño para los archivos de audio
- Considera usar HTTPS para proteger la transmisión de datos de audio

## Personalización

Puedes personalizar:

- Colores y estilos modificando las clases de Tailwind
- Formatos de audio cambiando el tipo MIME en el MediaRecorder
- Comportamiento al publicar modificando la función `onAudioPublished`
