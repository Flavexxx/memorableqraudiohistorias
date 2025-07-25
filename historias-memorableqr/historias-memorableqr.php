<?php
/**
 * Plugin Name: Historias MemorableQR
 * Plugin URI: https://memorableqr.com
 * Description: Plugin para grabar y compartir historias de audio
 * Version: 1.1.6
 * Author: MemorableQR Team
 * Author URI: https://memorableqr.com
 * License: GPL2
 */

// Prevenir el acceso directo al archivo
defined('ABSPATH') or die('No script kiddies please!');

// Separar la definición de la clase para mayor claridad
class HistoriasMemorableQRCore {
    private $plugin_options;
    private $plugin_path;
    private $plugin_url;
    private $debug_mode = true; // Activar modo depuración
    private $version;
    
    public function __construct() {
        // Definir versión del plugin (sin timestamp en producción)
        $this->version = '1.1.6';
        
        // Definir rutas del plugin
        $this->plugin_path = plugin_dir_path(__FILE__);
        $this->plugin_url = plugin_dir_url(__FILE__);
        
        // Log para depuración
        $this->debug_log("Plugin inicializado: " . $this->plugin_path);
        $this->debug_log("URL del plugin: " . $this->plugin_url);
        
        // Cargar opciones
        $this->load_options();
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts'], 999); // Alta prioridad para cargar después de otros scripts
        
        // Register shortcode
        add_shortcode('historias_memorableqr', [$this, 'render_audio_recorder']);
        
        // Add admin menu
        add_action('admin_menu', [$this, 'add_admin_menu']);
        
        // Register settings
        add_action('admin_init', [$this, 'register_settings']);
        
        // Agregar script de inicialización al pie de página para asegurar que se ejecute
        add_action('wp_footer', [$this, 'add_init_script'], 999); // Alta prioridad para ejecutar al final
    }
    
    /**
     * Función de depuración
     */
    private function debug_log($message) {
        if ($this->debug_mode) {
            error_log('HistoriasMemorableQR DEBUG: ' . $message);
        }
    }
    
    /**
     * Cargar opciones del plugin
     */
    private function load_options() {
        $default_options = [
            // Textos
            'texts' => [
                'main_title' => 'Grabemos juntos su historia',
                'title' => 'Grabador de Audio',
                'nameLabel' => 'Nombre',
                'namePlaceholder' => 'Ejemplo: Ana González',
                'relationLabel' => 'Parentezco',
                'relationPlaceholder' => 'Ejemplo: Hija, Amigo, Esposo...',
                'publishButton' => 'Publicar',
                'discardButton' => 'Descartar',
                'publishedStoriesTitle' => 'Historias publicadas',
                'noStories' => 'No hay historias publicadas aún.',
                'audioReady' => 'Audio listo para publicar',
                'footerMain' => 'Grabador de audio para WordPress',
                'footerSub' => 'Puedes grabar, revisar y publicar historias en homenaje'
            ],
            // Estilos
            'styles' => [
                'fontFamily' => 'inherit',
                'backgroundColor' => '#F8FAFC',
                'primaryColor' => '#2563eb',
                'secondaryColor' => '#FFFFFF',
                'borderColor' => '#E5E7EB',
                'borderRadius' => '0.75rem'
            ]
        ];
        
        $this->plugin_options = get_option('historias_memorableqr_options', $default_options);
    }

    public function enqueue_scripts() {
        // Versión para cache-busting con timestamp para desarrollo
        $version = $this->version . '-' . time();
        
        // Registrar estilos base (siempre existirán)
        wp_register_style(
            'historias-memorableqr-base-css', 
            $this->plugin_url . 'assets/css/base-styles.css', 
            [], 
            $version
        );
        wp_enqueue_style('historias-memorableqr-base-css');
        
        // Verificar y registrar estilos principales
        $css_path = 'assets/css/index.css';
        $css_file = $this->plugin_path . $css_path;
        $css_url = $this->plugin_url . $css_path;
        
        if (file_exists($css_file)) {
            $this->debug_log("CSS principal encontrado: " . $css_file);
            wp_register_style('historias-memorableqr-css', $css_url, [], $version);
            wp_enqueue_style('historias-memorableqr-css');
        } else {
            $this->debug_log("ERROR: CSS principal no encontrado en: " . $css_file);
        }
        
        // Verificar y registrar scripts - IMPORTANTE: Sin dependencia de jQuery
        $js_path = 'assets/js/index.js';
        $js_file = $this->plugin_path . $js_path;
        $js_url = $this->plugin_url . $js_path;
        
        if (file_exists($js_file)) {
            $this->debug_log("JS principal encontrado: " . $js_file . " URL: " . $js_url);
            
            // Registrar con prioridad alta en el footer
            wp_register_script(
                'historias-memorableqr-js', 
                $js_url, 
                [], // Sin dependencias
                $version, 
                true // Cargar en el footer
            );
            
            // Cargar script y asegurar que se carga después de todos los demás
            add_action('wp_footer', function() {
                wp_enqueue_script('historias-memorableqr-js');
            }, 998);
            
            // Pasar configuración al script
            wp_localize_script('historias-memorableqr-js', 'historiasMemorableQR', [
                'config' => $this->plugin_options,
                'ajaxurl' => admin_url('admin-ajax.php'),
                'plugin_url' => $this->plugin_url,
                'debug' => $this->debug_mode
            ]);
            
            $this->debug_log("Script principal registrado y configuración pasada.");
        } else {
            $this->debug_log("ERROR: JS principal no encontrado en: " . $js_file);
        }
    }
    
    /**
     * Añadir script de inicialización inline con intervalos más largos
     */
    public function add_init_script() {
        ?>
        <script>
        // Función autoejecutada y aislada del entorno global
        (function() {
            try {
                console.log('Script de inicialización de HistoriasMemorableQR cargado');
                
                // Función segura para verificar si la función de inicialización existe
                function checkInitFunction() {
                    return typeof window.initializeHistoriasMemorableQR === 'function';
                }
                
                // Función para inicializar el widget con reintentos
                function initializeWidgetsWithRetry(retries = 8, delay = 1500) {
                    console.log('Intentando inicializar widgets de HistoriasMemorableQR... (Intento ' + (9-retries) + ')');
                    
                    // Verificar si la función de inicialización está disponible
                    if (checkInitFunction()) {
                        console.log('Función de inicialización encontrada, ejecutando...');
                        try {
                            window.initializeHistoriasMemorableQR();
                            console.log('Inicialización completada exitosamente.');
                        } catch (error) {
                            console.error('Error durante la inicialización:', error);
                            if (retries > 0) {
                                console.log(`Reintentando inicialización en ${delay}ms... (${retries} intentos restantes)`);
                                setTimeout(() => initializeWidgetsWithRetry(retries - 1, delay), delay);
                            }
                        }
                    } else {
                        console.log('Función de inicialización no disponible todavía.');
                        if (retries > 0) {
                            console.log(`Esperando script... Reintentando en ${delay}ms (${retries} intentos restantes)`);
                            setTimeout(() => initializeWidgetsWithRetry(retries - 1, delay), delay);
                        } else {
                            console.error('La función de inicialización no se pudo cargar después de varios intentos.');
                            
                            // Último intento: buscar contenedores e inicializar manualmente
                            const containers = document.querySelectorAll('.historias-memorableqr-widget');
                            if (containers.length > 0) {
                                console.log('Encontrados contenedores sin inicializar, mostrando mensaje de error...');
                                containers.forEach(container => {
                                    container.innerHTML = '<div class="historias-memorableqr-error">' +
                                        '<p><strong>Error al cargar el grabador de audio</strong></p>' +
                                        '<p>El script de inicialización no pudo cargarse correctamente.</p>' +
                                        '<p>Si este error persiste, por favor contacte a soporte@memorableqr.com</p>' +
                                    '</div>';
                                });
                            }
                        }
                    }
                }
                
                // Iniciar con retrasos para dar tiempo al script principal
                function delayedInitialization() {
                    // Esperar más tiempo para asegurar que el script se ha cargado completamente
                    setTimeout(function() {
                        const containers = document.querySelectorAll('.historias-memorableqr-widget');
                        console.log(`Se encontraron ${containers.length} contenedores de Historias MemorableQR`);
                        
                        if (containers.length > 0) {
                            // Iniciar proceso con más retraso y más intentos
                            setTimeout(() => initializeWidgetsWithRetry(), 2000);
                        }
                    }, 1000);
                }
                
                // Usar diferentes estrategias de inicialización
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    delayedInitialization();
                } else {
                    window.addEventListener('DOMContentLoaded', delayedInitialization);
                    setTimeout(delayedInitialization, 3000); // Respaldo
                }
            } catch (globalError) {
                console.error("Error global en script de inicialización:", globalError);
            }
        })();
        </script>
        <?php
    }

    public function render_audio_recorder($atts = []) {
        // Incrementar contador para IDs únicos
        static $widget_counter = 0;
        $widget_counter++;
        
        // Configuración por defecto desde las opciones del plugin
        $default_config = $this->plugin_options;
        
        // Merge de configuraciones específicas del shortcode
        $shortcode_texts = shortcode_atts([
            'main_title' => $default_config['texts']['main_title'] ?? 'Grabemos juntos su historia',
            'title' => $default_config['texts']['title'] ?? 'Grabador de Audio',
            'published_stories_title' => $default_config['texts']['publishedStoriesTitle'] ?? 'Historias publicadas'
        ], $atts);
        
        // Actualizar la configuración con los atributos del shortcode
        $config = $default_config;
        $config['texts']['main_title'] = $shortcode_texts['main_title'];
        $config['texts']['title'] = $shortcode_texts['title'];
        $config['texts']['publishedStoriesTitle'] = $shortcode_texts['published_stories_title'];
        
        // Generar un ID único para cada instancia del widget
        $widget_id = 'historias-memorableqr-widget-' . $widget_counter;
        
        // Debug info
        $this->debug_log("Renderizando shortcode con ID: " . $widget_id);
        
        // Inicio del buffer de salida
        ob_start();
        ?>
        <div id="<?php echo esc_attr($widget_id); ?>" class="historias-memorableqr-widget"
             data-main-title="<?php echo esc_attr($config['texts']['main_title']); ?>"
             data-title="<?php echo esc_attr($config['texts']['title']); ?>"
             data-published-stories-title="<?php echo esc_attr($config['texts']['publishedStoriesTitle']); ?>">
            <div class="loading-indicator">
                Cargando grabador de audio... 
                <div class="hmqr-loader"></div>
                <div class="hmqr-debug-info" style="margin-top: 10px; font-size: 12px; color: #666;">
                    <div>ID: <?php echo esc_html($widget_id); ?></div>
                    <div>Plugin URL: <?php echo esc_html($this->plugin_url); ?></div>
                    <div>Version: <?php echo esc_html($this->version); ?></div>
                </div>
            </div>
            <script type="text/javascript">
                window.historiasMemorableQRConfig = window.historiasMemorableQRConfig || {};
                window.historiasMemorableQRConfig['<?php echo esc_js($widget_id); ?>'] = <?php echo wp_json_encode($config); ?>;
                console.log("Config asignada a ID:", "<?php echo esc_js($widget_id); ?>", window.historiasMemorableQRConfig['<?php echo esc_js($widget_id); ?>']);
            </script>
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
        
        // Subpáginas
        add_submenu_page(
            'historias-memorableqr',
            'Configuración',
            'Configuración',
            'manage_options',
            'historias-memorableqr-settings',
            [$this, 'settings_page']
        );
    }
    
    /**
     * Registrar ajustes
     */
    public function register_settings() {
        register_setting('historias_memorableqr_settings', 'historias_memorableqr_options');
    }
    
    /**
     * Renderizar página de administración principal
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
                
                <p>Puedes personalizar todos los textos y estilos del grabador visitando la página de <a href="<?php echo admin_url('admin.php?page=historias-memorableqr-settings'); ?>">Configuración</a>.</p>
                
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
                            <td><?php echo esc_html($this->plugin_options['texts']['main_title']); ?></td>
                        </tr>
                        <tr>
                            <td>title</td>
                            <td>Subtítulo del grabador</td>
                            <td><?php echo esc_html($this->plugin_options['texts']['title']); ?></td>
                        </tr>
                        <tr>
                            <td>published_stories_title</td>
                            <td>Título de la sección de historias publicadas</td>
                            <td><?php echo esc_html($this->plugin_options['texts']['publishedStoriesTitle']); ?></td>
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
    
    /**
     * Renderizar página de configuración
     */
    public function settings_page() {
        // Guardar cambios si se envía el formulario
        if (isset($_POST['submit']) && check_admin_referer('historias_memorableqr_settings')) {
            $options = [];
            
            // Guardar textos
            $options['texts'] = [
                'main_title' => sanitize_text_field($_POST['main_title'] ?? ''),
                'title' => sanitize_text_field($_POST['title'] ?? ''),
                'nameLabel' => sanitize_text_field($_POST['nameLabel'] ?? ''),
                'namePlaceholder' => sanitize_text_field($_POST['namePlaceholder'] ?? ''),
                'relationLabel' => sanitize_text_field($_POST['relationLabel'] ?? ''),
                'relationPlaceholder' => sanitize_text_field($_POST['relationPlaceholder'] ?? ''),
                'publishButton' => sanitize_text_field($_POST['publishButton'] ?? ''),
                'discardButton' => sanitize_text_field($_POST['discardButton'] ?? ''),
                'publishedStoriesTitle' => sanitize_text_field($_POST['publishedStoriesTitle'] ?? ''),
                'noStories' => sanitize_text_field($_POST['noStories'] ?? ''),
                'audioReady' => sanitize_text_field($_POST['audioReady'] ?? ''),
                'footerMain' => sanitize_text_field($_POST['footerMain'] ?? ''),
                'footerSub' => sanitize_text_field($_POST['footerSub'] ?? '')
            ];
            
            // Guardar estilos
            $options['styles'] = [
                'fontFamily' => sanitize_text_field($_POST['fontFamily'] ?? ''),
                'backgroundColor' => sanitize_hex_color_no_hash($_POST['backgroundColor'] ?? ''),
                'primaryColor' => sanitize_hex_color_no_hash($_POST['primaryColor'] ?? ''),
                'secondaryColor' => sanitize_hex_color_no_hash($_POST['secondaryColor'] ?? ''),
                'borderColor' => sanitize_hex_color_no_hash($_POST['borderColor'] ?? ''),
                'borderRadius' => sanitize_text_field($_POST['borderRadius'] ?? '')
            ];
            
            // Añadir prefijo # a los colores si es necesario
            foreach (['backgroundColor', 'primaryColor', 'secondaryColor', 'borderColor'] as $colorKey) {
                if (!empty($options['styles'][$colorKey]) && substr($options['styles'][$colorKey], 0, 1) !== '#') {
                    $options['styles'][$colorKey] = '#' . $options['styles'][$colorKey];
                }
            }
            
            // Guardar opciones
            update_option('historias_memorableqr_options', $options);
            
            // Recargar opciones
            $this->plugin_options = $options;
            
            echo '<div class="notice notice-success"><p>Configuración guardada con éxito.</p></div>';
        }
        
        // Obtener valores actuales
        $texts = $this->plugin_options['texts'];
        $styles = $this->plugin_options['styles'];
        
        ?>
        <div class="wrap">
            <h1>Configuración de Historias MemorableQR</h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('historias_memorableqr_settings'); ?>
                
                <div class="card" style="max-width: 800px; margin-top: 20px; padding: 20px;">
                    <h2>Personalización de textos</h2>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="main_title">Título principal</label></th>
                            <td><input name="main_title" type="text" id="main_title" value="<?php echo esc_attr($texts['main_title']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="title">Subtítulo</label></th>
                            <td><input name="title" type="text" id="title" value="<?php echo esc_attr($texts['title']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="nameLabel">Etiqueta de nombre</label></th>
                            <td><input name="nameLabel" type="text" id="nameLabel" value="<?php echo esc_attr($texts['nameLabel']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="namePlaceholder">Placeholder de nombre</label></th>
                            <td><input name="namePlaceholder" type="text" id="namePlaceholder" value="<?php echo esc_attr($texts['namePlaceholder']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="relationLabel">Etiqueta de parentezco</label></th>
                            <td><input name="relationLabel" type="text" id="relationLabel" value="<?php echo esc_attr($texts['relationLabel']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="relationPlaceholder">Placeholder de parentezco</label></th>
                            <td><input name="relationPlaceholder" type="text" id="relationPlaceholder" value="<?php echo esc_attr($texts['relationPlaceholder']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="publishButton">Botón publicar</label></th>
                            <td><input name="publishButton" type="text" id="publishButton" value="<?php echo esc_attr($texts['publishButton']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="discardButton">Botón descartar</label></th>
                            <td><input name="discardButton" type="text" id="discardButton" value="<?php echo esc_attr($texts['discardButton']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="publishedStoriesTitle">Título de historias publicadas</label></th>
                            <td><input name="publishedStoriesTitle" type="text" id="publishedStoriesTitle" value="<?php echo esc_attr($texts['publishedStoriesTitle']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="noStories">Mensaje sin historias</label></th>
                            <td><input name="noStories" type="text" id="noStories" value="<?php echo esc_attr($texts['noStories']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="audioReady">Mensaje audio listo</label></th>
                            <td><input name="audioReady" type="text" id="audioReady" value="<?php echo esc_attr($texts['audioReady']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="footerMain">Texto principal del pie</label></th>
                            <td><input name="footerMain" type="text" id="footerMain" value="<?php echo esc_attr($texts['footerMain']); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="footerSub">Texto secundario del pie</label></th>
                            <td><input name="footerSub" type="text" id="footerSub" value="<?php echo esc_attr($texts['footerSub']); ?>" class="regular-text"></td>
                        </tr>
                    </table>
                </div>
                
                <div class="card" style="max-width: 800px; margin-top: 20px; padding: 20px;">
                    <h2>Personalización de estilos</h2>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="fontFamily">Fuente</label></th>
                            <td>
                                <select name="fontFamily" id="fontFamily">
                                    <option value="inherit" <?php selected($styles['fontFamily'], 'inherit'); ?>>Predeterminada del sitio</option>
                                    <option value="'Arial', sans-serif" <?php selected($styles['fontFamily'], "'Arial', sans-serif"); ?>>Arial</option>
                                    <option value="'Helvetica', sans-serif" <?php selected($styles['fontFamily'], "'Helvetica', sans-serif"); ?>>Helvetica</option>
                                    <option value="'Georgia', serif" <?php selected($styles['fontFamily'], "'Georgia', serif"); ?>>Georgia</option>
                                    <option value="'Times New Roman', serif" <?php selected($styles['fontFamily'], "'Times New Roman', serif"); ?>>Times New Roman</option>
                                    <option value="'Courier New', monospace" <?php selected($styles['fontFamily'], "'Courier New', monospace"); ?>>Courier New</option>
                                    <option value="'Verdana', sans-serif" <?php selected($styles['fontFamily'], "'Verdana', sans-serif"); ?>>Verdana</option>
                                    <option value="'Roboto', sans-serif" <?php selected($styles['fontFamily'], "'Roboto', sans-serif"); ?>>Roboto</option>
                                    <option value="'Open Sans', sans-serif" <?php selected($styles['fontFamily'], "'Open Sans', sans-serif"); ?>>Open Sans</option>
                                </select>
                                <p class="description">Se utilizarán las fuentes instaladas en tu tema si seleccionas "Predeterminada del sitio".</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="backgroundColor">Color de fondo</label></th>
                            <td><input name="backgroundColor" type="color" id="backgroundColor" value="<?php echo esc_attr($styles['backgroundColor']); ?>" class="color-picker"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="primaryColor">Color primario</label></th>
                            <td>
                                <input name="primaryColor" type="color" id="primaryColor" value="<?php echo esc_attr($styles['primaryColor']); ?>" class="color-picker">
                                <p class="description">Se usa para títulos, botones y elementos destacados.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="secondaryColor">Color secundario</label></th>
                            <td><input name="secondaryColor" type="color" id="secondaryColor" value="<?php echo esc_attr($styles['secondaryColor']); ?>" class="color-picker"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="borderColor">Color de bordes</label></th>
                            <td><input name="borderColor" type="color" id="borderColor" value="<?php echo esc_attr($styles['borderColor']); ?>" class="color-picker"></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="borderRadius">Radio de bordes</label></th>
                            <td>
                                <select name="borderRadius" id="borderRadius">
                                    <option value="0" <?php selected($styles['borderRadius'], '0'); ?>>Sin redondeo</option>
                                    <option value="0.25rem" <?php selected($styles['borderRadius'], '0.25rem'); ?>>Pequeño (0.25rem)</option>
                                    <option value="0.5rem" <?php selected($styles['borderRadius'], '0.5rem'); ?>>Medio (0.5rem)</option>
                                    <option value="0.75rem" <?php selected($styles['borderRadius'], '0.75rem'); ?>>Grande (0.75rem)</option>
                                    <option value="1rem" <?php selected($styles['borderRadius'], '1rem'); ?>>Muy grande (1rem)</option>
                                    <option value="9999px" <?php selected($styles['borderRadius'], '9999px'); ?>>Completamente redondeado</option>
                                </select>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <p class="submit">
                    <input type="submit" name="submit" id="submit" class="button button-primary" value="Guardar cambios">
                </p>
            </form>
        </div>
        <?php
    }
}

// Inicializar plugin con una función de inicialización
function historias_memorableqr_init() {
    // Inicializar el plugin solo si está en el área de administración o en el frontend
    if (is_admin() || (!is_admin() && !defined('DOING_AJAX'))) {
        new HistoriasMemorableQRCore();
    }
}

// Usar función de inicialización para prevenir problemas de salida
add_action('plugins_loaded', 'historias_memorableqr_init');
