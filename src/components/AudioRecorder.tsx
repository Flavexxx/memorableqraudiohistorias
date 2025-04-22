
import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AudioWaveform from "./AudioWaveform";

interface AudioRecorderProps {
  onAudioPublished?: (audioBlob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioPublished,
}) => {
  // Estados para manejar el grabador
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingComplete, setRecordingComplete] = useState(false);

  // Referencias para los elementos de audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Efecto para iniciar/detener el temporizador durante la grabación
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Efecto para crear el elemento de audio cuando tengamos una URL
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      return () => {
        audio.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
      };
    }
  }, [audioUrl]);

  // Inicia la grabación
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        setRecordingComplete(true);
        
        // Detener las pistas del stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setRecordingComplete(false);
      
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
    }
  };

  // Detiene la grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Reproduce el audio grabado
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Descarta la grabación actual y prepara para una nueva
  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingComplete(false);
    setRecordingTime(0);
  };

  // Publica el audio (enviándolo al callback)
  const publishAudio = () => {
    if (audioBlob && onAudioPublished) {
      onAudioPublished(audioBlob);
    }
  };

  // Formatea el tiempo de grabación a MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Grabador de Audio</h2>
      </div>
      
      {/* Visualización del tiempo de grabación */}
      <div className="flex justify-center mb-4">
        <div 
          className={cn(
            "px-4 py-2 rounded-full text-lg font-semibold",
            isRecording ? "bg-red-50 text-red-600 animate-pulse" : "bg-gray-100 text-gray-600"
          )}
        >
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Controles principales */}
      <div className="flex justify-center gap-4 mb-6">
        {!recordingComplete ? (
          <>
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center"
              >
                <Mic size={24} />
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center animate-pulse"
              >
                <MicOff size={24} />
              </Button>
            )}
          </>
        ) : (
          <div className="flex gap-4">
            {/* Botón reproducir/pausar */}
            <Button
              onClick={togglePlayback}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            
            {/* Botón regrabar */}
            <Button
              onClick={discardRecording}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-500 hover:bg-red-50"
            >
              Regrabar
            </Button>
            
            {/* Botón publicar */}
            <Button
              onClick={publishAudio}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Publicar
            </Button>
          </div>
        )}
      </div>

      {/* Visualización de la forma de onda */}
      <div className="mb-4">
        <AudioWaveform 
          isRecording={isRecording} 
          audioUrl={audioUrl}
          isPlaying={isPlaying}
        />
      </div>
      
      {/* Instrucciones */}
      <div className="text-center text-gray-500 text-sm">
        {!recordingComplete ? (
          isRecording ? 
            "Hablando... Toca el botón para detener la grabación" :
            "Toca el botón para comenzar a grabar"
        ) : (
          "Escucha tu grabación, publícala o vuelve a grabar"
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
