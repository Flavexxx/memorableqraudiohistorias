// Entry point for WordPress plugin
console.log('HistoriasMemorableQR script loaded');

// WordPress plugin initialization
window.initializeHistoriasMemorableQR = function() {
    console.log('Initializing HistoriasMemorableQR widgets...');
    
    // Find all widget containers
    const containers = document.querySelectorAll('.historias-memorableqr-widget');
    console.log(`Found ${containers.length} widget containers`);
    
    containers.forEach((container, index) => {
        try {
            const widgetId = container.id;
            console.log(`Initializing widget: ${widgetId}`);
            
            // Get configuration for this widget
            const config = window.historiasMemorableQRConfig && window.historiasMemorableQRConfig[widgetId];
            
            if (!config) {
                console.error(`No configuration found for widget: ${widgetId}`);
                container.innerHTML = '<div class="error">Error: No se encontró la configuración del widget</div>';
                return;
            }
            
            // Clear the loading content
            container.innerHTML = '';
            
            // Create the widget HTML structure
            const widgetHTML = `
                <div class="historias-memorableqr-container" style="
                    font-family: ${config.styles?.fontFamily || 'inherit'};
                    background-color: ${config.styles?.backgroundColor || '#f8fafc'};
                    border: 1px solid ${config.styles?.borderColor || '#e5e7eb'};
                    border-radius: ${config.styles?.borderRadius || '0.75rem'};
                    padding: 1.5rem;
                    max-width: 600px;
                    margin: 0 auto;
                ">
                    <h2 style="color: ${config.styles?.primaryColor || '#2563eb'}; margin-bottom: 1rem;">
                        ${config.texts?.main_title || 'Grabemos juntos su historia'}
                    </h2>
                    <h3 style="margin-bottom: 1.5rem;">
                        ${config.texts?.title || 'Grabador de Audio'}
                    </h3>
                    
                    <!-- Audio Recorder Section -->
                    <div class="audio-recorder-section" style="margin-bottom: 1.5rem;">
                        <div class="recorder-controls" style="text-align: center; margin-bottom: 1rem;">
                            <button id="recordBtn-${widgetId}" style="
                                background-color: ${config.styles?.primaryColor || '#2563eb'};
                                color: white;
                                border: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: ${config.styles?.borderRadius || '0.75rem'};
                                font-size: 1rem;
                                cursor: pointer;
                                margin-right: 0.5rem;
                            ">🎤 Grabar</button>
                            <button id="stopBtn-${widgetId}" style="
                                background-color: #dc2626;
                                color: white;
                                border: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: ${config.styles?.borderRadius || '0.75rem'};
                                font-size: 1rem;
                                cursor: pointer;
                                display: none;
                            ">⏹️ Detener</button>
                        </div>
                        <div id="recordingStatus-${widgetId}" style="text-align: center; margin: 0.5rem 0;"></div>
                        <div id="audioPlayer-${widgetId}" style="margin: 1rem 0; text-align: center; display: none;">
                            <audio controls style="width: 100%; max-width: 400px;"></audio>
                        </div>
                    </div>
                    
                    <!-- User Input Section -->
                    <div class="user-input-section" id="userInputSection-${widgetId}" style="display: none; margin-bottom: 1.5rem;">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                                ${config.texts?.nameLabel || 'Nombre'}
                            </label>
                            <input 
                                type="text" 
                                id="userName-${widgetId}" 
                                placeholder="${config.texts?.namePlaceholder || 'Ejemplo: Ana González'}" 
                                style="
                                    width: 100%;
                                    padding: 0.75rem;
                                    border: 1px solid ${config.styles?.borderColor || '#e5e7eb'};
                                    border-radius: ${config.styles?.borderRadius || '0.75rem'};
                                    font-size: 1rem;
                                "
                            />
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                                ${config.texts?.relationLabel || 'Parentezco'}
                            </label>
                            <input 
                                type="text" 
                                id="userRelation-${widgetId}" 
                                placeholder="${config.texts?.relationPlaceholder || 'Ejemplo: Hija, Amigo, Esposo...'}" 
                                style="
                                    width: 100%;
                                    padding: 0.75rem;
                                    border: 1px solid ${config.styles?.borderColor || '#e5e7eb'};
                                    border-radius: ${config.styles?.borderRadius || '0.75rem'};
                                    font-size: 1rem;
                                "
                            />
                        </div>
                        <div style="text-align: center;">
                            <button id="publishBtn-${widgetId}" style="
                                background-color: #16a34a;
                                color: white;
                                border: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: ${config.styles?.borderRadius || '0.75rem'};
                                font-size: 1rem;
                                cursor: pointer;
                                margin-right: 0.5rem;
                            ">${config.texts?.publishButton || 'Publicar'}</button>
                            <button id="discardBtn-${widgetId}" style="
                                background-color: #6b7280;
                                color: white;
                                border: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: ${config.styles?.borderRadius || '0.75rem'};
                                font-size: 1rem;
                                cursor: pointer;
                            ">${config.texts?.discardButton || 'Descartar'}</button>
                        </div>
                    </div>
                    
                    <!-- Published Stories Section -->
                    <div class="published-stories-section">
                        <h4 style="margin-bottom: 1rem;">
                            ${config.texts?.publishedStoriesTitle || 'Historias publicadas'}
                        </h4>
                        <div id="storiesList-${widgetId}" style="margin-bottom: 1rem;">
                            <p style="color: #6b7280; text-align: center;">
                                ${config.texts?.noStories || 'No hay historias publicadas aún.'}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid ${config.styles?.borderColor || '#e5e7eb'};">
                        <p style="color: #6b7280; font-size: 0.875rem; margin: 0;">
                            ${config.texts?.footerMain || 'Grabador de audio para WordPress'}
                        </p>
                        <p style="color: #6b7280; font-size: 0.75rem; margin: 0.25rem 0 0 0;">
                            ${config.texts?.footerSub || 'Puedes grabar, revisar y publicar historias en homenaje'}
                        </p>
                    </div>
                </div>
            `;
            
            container.innerHTML = widgetHTML;
            
            // Initialize audio recording functionality
            initializeAudioRecorder(widgetId, config);
            
        } catch (error) {
            console.error(`Error initializing widget ${container.id}:`, error);
            container.innerHTML = '<div class="error">Error al inicializar el widget de audio</div>';
        }
    });
};

// Audio recording functionality
function initializeAudioRecorder(widgetId, config) {
    let mediaRecorder = null;
    let audioChunks = [];
    let currentAudioBlob = null;
    let stories = [];
    
    const recordBtn = document.getElementById(`recordBtn-${widgetId}`);
    const stopBtn = document.getElementById(`stopBtn-${widgetId}`);
    const recordingStatus = document.getElementById(`recordingStatus-${widgetId}`);
    const audioPlayer = document.getElementById(`audioPlayer-${widgetId}`);
    const userInputSection = document.getElementById(`userInputSection-${widgetId}`);
    const publishBtn = document.getElementById(`publishBtn-${widgetId}`);
    const discardBtn = document.getElementById(`discardBtn-${widgetId}`);
    const storiesList = document.getElementById(`storiesList-${widgetId}`);
    
    // Record button click handler
    recordBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                currentAudioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(currentAudioBlob);
                
                const audio = audioPlayer.querySelector('audio');
                audio.src = audioUrl;
                audioPlayer.style.display = 'block';
                userInputSection.style.display = 'block';
                recordingStatus.textContent = config.texts?.audioReady || 'Audio listo para publicar';
                recordingStatus.style.color = '#16a34a';
                
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            recordBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            recordingStatus.textContent = '🔴 Grabando...';
            recordingStatus.style.color = '#dc2626';
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            recordingStatus.textContent = 'Error: No se pudo acceder al micrófono';
            recordingStatus.style.color = '#dc2626';
        }
    });
    
    // Stop button click handler
    stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            recordBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        }
    });
    
    // Publish button click handler
    publishBtn.addEventListener('click', () => {
        const userName = document.getElementById(`userName-${widgetId}`).value.trim();
        const userRelation = document.getElementById(`userRelation-${widgetId}`).value.trim();
        
        if (!userName || !userRelation || !currentAudioBlob) {
            alert('Por favor completa todos los campos antes de publicar');
            return;
        }
        
        const story = {
            id: Date.now().toString(),
            name: userName,
            relation: userRelation,
            audioUrl: URL.createObjectURL(currentAudioBlob),
            timestamp: new Date().toLocaleString()
        };
        
        stories.push(story);
        renderStories();
        resetForm();
    });
    
    // Discard button click handler
    discardBtn.addEventListener('click', () => {
        resetForm();
    });
    
    // Reset form function
    function resetForm() {
        currentAudioBlob = null;
        audioPlayer.style.display = 'none';
        userInputSection.style.display = 'none';
        recordingStatus.textContent = '';
        document.getElementById(`userName-${widgetId}`).value = '';
        document.getElementById(`userRelation-${widgetId}`).value = '';
        recordBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
    }
    
    // Render stories function
    function renderStories() {
        if (stories.length === 0) {
            storiesList.innerHTML = `<p style="color: #6b7280; text-align: center;">${config.texts?.noStories || 'No hay historias publicadas aún.'}</p>`;
            return;
        }
        
        const storiesHTML = stories.map(story => `
            <div style="
                border: 1px solid ${config.styles?.borderColor || '#e5e7eb'};
                border-radius: ${config.styles?.borderRadius || '0.75rem'};
                padding: 1rem;
                margin-bottom: 1rem;
                background-color: ${config.styles?.secondaryColor || '#ffffff'};
            ">
                <div style="margin-bottom: 0.5rem;">
                    <strong>${story.name}</strong> - ${story.relation}
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <audio controls style="width: 100%;">
                        <source src="${story.audioUrl}" type="audio/wav">
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                </div>
                <div style="font-size: 0.875rem; color: #6b7280;">
                    Publicado: ${story.timestamp}
                </div>
            </div>
        `).join('');
        
        storiesList.innerHTML = storiesHTML;
    }
}

console.log('HistoriasMemorableQR script initialization complete');