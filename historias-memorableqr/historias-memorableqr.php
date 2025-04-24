
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
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        
        // Register shortcode
        add_shortcode('historias_memorableqr', [$this, 'render_audio_recorder']);
        
        // Add admin menu
        add_action('admin_menu', [$this, 'add_admin_menu']);
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
    
    /**
     * Añadir menú al panel de administración
     */
    public function add_admin_menu() {
        add_menu_page(
            'Historias MemorableQR', 
            'Historias MQR', 
            'manage_options', 
            'historias-memorableqr', 
            [$this, 'admin_page'], 
            'dashicons-microphone', 
            30
        );
    }
    
    /**
     * Renderizar página de administración
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Historias MemorableQR</h1>
            
            <div class="card" style="max-width: 800px; margin-top: 20px; padding: 20px;">
                <h2>Cómo usar el plugin</h2>
                <p>Para insertar el grabador de audio en cualquier página o entrada, utiliza el siguiente shortcode:</p>
                
                <div style="background: #f0f0f0; padding: 15px; margin: 10px 0; border-left: 4px solid #0073aa;">
                    <code>[historias_memorableqr]</code>
                </div>
                
                <p>También puedes personalizar los textos:</p>
                
                <div style="background: #f0f0f0; padding: 15px; margin: 10px 0; border-left: 4px solid #0073aa;">
                    <code>[historias_memorableqr main_title="Título personalizado" title="Grabador" published_stories_title="Historias"]</code>
                </div>
                
                <h3>Uso en Elementor</h3>
                <ol>
                    <li>Edita tu página con Elementor</li>
                    <li>Arrastra un widget de <strong>Texto</strong> o <strong>Shortcode</strong> a tu diseño</li>
                    <li>Si usas el widget de Texto, cambia al modo HTML</li>
                    <li>Inserta el shortcode <code>[historias_memorableqr]</code></li>
                    <li>Guarda y visualiza tu página</li>
                </ol>
            </div>
            
            <div class="card" style="max-width: 800px; margin-top: 20px; padding: 20px;">
                <h2>Opciones de personalización</h2>
                
                <table class="widefat" style="margin-top: 15px;">
                    <thead>
                        <tr>
                            <th>Atributo</th>
                            <th>Descripción</th>
                            <th>Valor por defecto</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>main_title</td>
                            <td>Título principal que aparece en la parte superior</td>
                            <td>Grabemos juntos su historia</td>
                        </tr>
                        <tr>
                            <td>title</td>
                            <td>Subtítulo del grabador</td>
                            <td>Grabador de Audio</td>
                        </tr>
                        <tr>
                            <td>published_stories_title</td>
                            <td>Título de la sección de historias publicadas</td>
                            <td>Historias publicadas</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="card" style="max-width: 800px; margin-top: 20px; padding: 20px;">
                <h2>Soporte</h2>
                <p>Para obtener ayuda con este plugin, contacta a <a href="mailto:soporte@memorableqr.com">soporte@memorableqr.com</a></p>
            </div>
        </div>
        <?php
    }
}

// Inicializar plugin
new HistoriasMemorableQR();
