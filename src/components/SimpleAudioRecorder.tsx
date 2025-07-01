
import React, { useState, useRef, useCallback } from 'react';

interface SimpleAudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
}

const SimpleAudioRecorder: React.FC<SimpleAudioRecorderProps> = ({ onAudioReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onAudioReady(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor, permite el acceso.');
    }
  }, [onAudioReady]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hmqr-recorder">
      {!audioURL ? (
        <div className="hmqr-recording-controls">
          {!isRecording ? (
            <button
              className="hmqr-button hmqr-button-record"
              onClick={startRecording}
            >
              🎤 Grabar
            </button>
          ) : (
            <div className="hmqr-recording-active">
              <div className="hmqr-recording-indicator">
                <span className="hmqr-recording-dot"></span>
                Grabando... {formatTime(recordingTime)}
              </div>
              <button
                className="hmqr-button hmqr-button-stop"
                onClick={stopRecording}
              >
                ⏹️ Detener
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="hmqr-playback">
          <p>Reproduce tu grabación:</p>
          <audio src={audioURL} controls className="hmqr-audio" />
        </div>
      )}
    </div>
  );
};

export default SimpleAudioRecorder;
