
<?php
/**
 * Plugin Name: Historias MemorableQR
 * Plugin URI: https://memorableqr.com
 * Description: Plugin para grabar y compartir historias de audio
 * Version: 1.0.0
 * Author: MemorableQR Team
 * Author URI: https://memorableqr.com
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class HistoriasMemorableQR {
    public function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_shortcode('historias_memorableqr', [$this, 'render_audio_recorder']);
    }

    public function enqueue_scripts() {
        // Cargar scripts y estilos
        wp_enqueue_script('historias-memorableqr-js', plugin_dir_url(__FILE__) . 'assets/js/index.js', [], '1.0.0', true);
        wp_enqueue_style('historias-memorableqr-css', plugin_dir_url(__FILE__) . 'assets/css/index.css', [], '1.0.0');
    }

    public function render_audio_recorder($atts = []) {
        // Configuración por defecto
        $default_config = [
            'main_title' => 'Grabemos juntos su historia',
            'title' => 'Grabador de Audio',
            'published_stories_title' => 'Historias publicadas'
        ];

        // Merge de configuraciones
        $config = shortcode_atts($default_config, $atts);

        // Inicio del buffer de salida
        ob_start();
        ?>
        <div id="historias-memorableqr-widget" 
             data-main-title="<?php echo esc_attr($config['main_title']); ?>"
             data-title="<?php echo esc_attr($config['title']); ?>"
             data-published-stories-title="<?php echo esc_attr($config['published_stories_title']); ?>">
            <!-- Contenedor para el widget React -->
        </div>
        <?php
        return ob_get_clean();
    }
}

// Inicializar plugin
new HistoriasMemorableQR();
