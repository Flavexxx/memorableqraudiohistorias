
import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  audioUrl?: string | null;
  isPlaying?: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  isRecording, 
  audioUrl, 
  isPlaying = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  
  // Configuración de la visualización
  const setupAudioContext = async (stream?: MediaStream) => {
    if (!canvasRef.current) return;
    
    // Crear o reutilizar el contexto de audio
    const audioContext = audioContextRef.current || new AudioContext();
    audioContextRef.current = audioContext;
    
    // Configurar el analizador
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    
    // Conectar fuente según el modo (grabación o reproducción)
    if (stream) {
      // Modo grabación
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
    } else if (audioUrl && !isRecording) {
      // Modo reproducción
      const audio = new Audio(audioUrl);
      audio.loop = true;
      if (isPlaying) {
        audio.play();
      }
      
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceRef.current = source;
    }
    
    // Iniciar animación
    drawWaveform();
  };
  
  // Dibujar la forma de onda
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Ajustar la resolución del canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Función de animación
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      ctx.clearRect(0, 0, width, height);
      
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const barWidth = (width / dataArrayRef.current.length) * 2.5;
      let x = 0;
      
      ctx.fillStyle = isRecording ? '#ef4444' : '#3b82f6'; // Rojo si grabando, azul si reproduciendo
      
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * height * 0.8;
        
        // Dibuja las barras de la forma de onda
        ctx.fillRect(x, height / 2 - barHeight / 2, barWidth - 1, barHeight);
        
        x += barWidth;
      }
    };
    
    // Iniciar la animación
    animate();
  };
  
  // Gestionar el inicio/finalización de grabación
  useEffect(() => {
    if (isRecording) {
      // Obtener acceso al micrófono para visualización
      const getMedia = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          await setupAudioContext(stream);
        } catch (err) {
          console.error("Error accediendo al micrófono para visualización:", err);
        }
      };
      
      getMedia();
    } else if (audioUrl) {
      // Configurar visualización para reproducción
      setupAudioContext();
    }
    
    // Limpieza
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Liberar recursos de audio
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        //audioContextRef.current.close();
      }
    };
  }, [isRecording, audioUrl, isPlaying]);
  
  return (
    <div className="w-full h-20 bg-gray-50 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default AudioWaveform;
