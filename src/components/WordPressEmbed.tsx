
import React from 'react';
import AudioRecorder from './AudioRecorder';

const WordPressEmbed: React.FC = () => {
  // Esta función puede adaptarse para integrarse con los endpoints de WordPress
  const handleAudioPublished = (audioBlob: Blob) => {
    // En un escenario real, aquí se enviaría el archivo a WordPress
    // utilizando la API REST de WordPress o un endpoint personalizado
    
    // Crear un objeto FormData para enviar el archivo
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'grabacion.webm');
    
    // Datos adicionales que podrían necesitarse
    formData.append('post_id', window.location.search.split('post_id=')[1]?.split('&')[0] || '0');
    formData.append('action', 'upload_audio_recording');
    
    console.log('Listo para enviar a WordPress. En una implementación real, esto se enviaría a un endpoint.');
    
    // Ejemplo de código para enviar a WordPress (comentado)
    /*
    fetch('/wp-admin/admin-ajax.php', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('¡Audio subido correctamente!');
      } else {
        alert('Error al subir el audio: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error al subir:', error);
      alert('Error de conexión al subir el audio');
    });
    */
    
    // Para la demo, simplemente mostramos un mensaje
    alert('¡Audio grabado con éxito! En un entorno real, este archivo se enviaría a WordPress.');
  };

  return (
    <div className="wordpress-audio-recorder-embed">
      <AudioRecorder onAudioPublished={handleAudioPublished} />
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Grabador de audio para WordPress</p>
      </div>
    </div>
  );
};

export default WordPressEmbed;
