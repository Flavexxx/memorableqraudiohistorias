
import React, { useState, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { WidgetConfig } from "@/types/WidgetConfig";

// Por defecto, si no hay config global disponible
const defaultConfig: WidgetConfig = {
  texts: {
    mainTitle: "Grabemos juntos su historia", // Título personalizable por defecto
    title: "Grabador de audio para WordPress",
    nameLabel: "Nombre",
    namePlaceholder: "Ejemplo: Ana González",
    relationLabel: "Parentezco",
    relationPlaceholder: "Ejemplo: Hija, Amigo, Esposo...",
    publishButton: "Publicar",
    discardButton: "Descartar",
    publishedStoriesTitle: "Historias publicadas",
    noStories: "No hay historias publicadas aún.",
    audioReady: "Audio listo para publicar",
    footerMain: "Grabador de audio para WordPress",
    footerSub: "Puedes grabar, revisar y publicar historias en homenaje"
  },
  styles: {
    fontFamily: "inherit",
    backgroundColor: "#F8FAFC", // bg-gray-50
    primaryColor: "#2563eb", // blue-600
    secondaryColor: "#FFFFFF",
    borderColor: "#E5E7EB", // gray-200
    borderRadius: "0.75rem"
  }
};

// Declaración global para el tipo de configuración en window
declare global {
  interface Window {
    audioRecorderConfig?: WidgetConfig;
    historiasMemorableQR?: {
      config?: WidgetConfig;
      debug?: boolean;
    };
  }
}

interface Story {
  audioUrl: string;
  audioBlob: Blob;
  name: string;
  relation: string;
  id: string;
}

interface WordPressEmbedProps {
  config?: WidgetConfig;
}

const WordPressEmbed: React.FC<WordPressEmbedProps> = (props) => {
  // Función de log para depuración
  const debugLog = (message: string, ...args: any[]) => {
    if (window.historiasMemorableQR?.debug) {
      console.log(`[WordPressEmbed] ${message}`, ...args);
    }
  };

  // Log inicial
  debugLog('Componente WordPressEmbed inicializando');
  debugLog('Props recibidos:', props);

  // Estado para la configuración
  const [config, setConfig] = useState<WidgetConfig>(
    props.config || window.audioRecorderConfig || defaultConfig
  );

  // Estado para rastrear si el componente está montado
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Marcar como montado
    setIsMounted(true);
    debugLog('Componente montado');

    // Actualizar configuración si viene en props
    if (props.config) {
      debugLog('Actualizando config desde props', props.config);
      setConfig(props.config);
    } else if (window.audioRecorderConfig) {
      debugLog('Actualizando config desde window.audioRecorderConfig', window.audioRecorderConfig);
      setConfig(window.audioRecorderConfig);
    }
    
    // Cleanup
    return () => {
      debugLog('Componente desmontado');
      setIsMounted(false);
    };
  }, [props.config]);

  // Asegurar que tenemos textos y estilos
  const texts = config.texts || defaultConfig.texts!;
  const styles = config.styles || defaultConfig.styles!;

  debugLog('Usando configuración:', { texts, styles });

  // Estados del formulario y audio
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const { toast } = useToast();

  const handleAudioReady = (audioBlob: Blob) => {
    debugLog('Audio listo recibido');
    setPendingAudio(audioBlob);
  };

  const handlePublish = () => {
    if (!name.trim() || !relation.trim() || !pendingAudio) {
      debugLog('No se puede publicar: faltan datos');
      return;
    }

    debugLog('Publicando historia');
    const audioUrl = URL.createObjectURL(pendingAudio);
    const newStory: Story = {
      audioUrl,
      audioBlob: pendingAudio,
      name,
      relation,
      id: Date.now().toString(),
    };

    setStories(prevStories => [newStory, ...prevStories]);

    toast({
      title: texts.publishedStoriesTitle,
      description: `La historia de ${name} ha sido publicada exitosamente.`,
    });

    setPendingAudio(null);
    setName("");
    setRelation("");
    debugLog('Historia publicada exitosamente');
  };

  const handleDiscard = () => {
    debugLog('Audio descartado');
    setPendingAudio(null);
  };

  const canPublish = name.trim() && relation.trim() && pendingAudio;

  // Estilos customizables
  const wrapperStyles: React.CSSProperties = {
    fontFamily: styles.fontFamily,
    background: styles.backgroundColor,
    borderColor: styles.borderColor,
    borderRadius: styles.borderRadius,
    padding: '1rem',
    maxWidth: '800px',
    margin: '0 auto',
  };

  // Si hay un error, mostrar mensaje
  if (!isMounted) {
    return (
      <div className="p-4 text-red-500">
        Cargando componente...
      </div>
    );
  }

  debugLog('Renderizando componente');
  return (
    <div
      className="wordpress-audio-recorder-embed"
      style={wrapperStyles}
    >
      <div className="mb-4 p-4" style={{
        background: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        boxShadow: "0 1px 8px 0 #0001",
        border: `1px solid ${styles.borderColor}`,
      }}>
        <div className="mb-4 text-lg font-semibold text-center" style={{ color: styles.primaryColor }}>
          {texts.mainTitle || texts.title} {/* Prioriza mainTitle, fallback a title */}
        </div>
        <div className="mb-2">
          <Label htmlFor="nombre">{texts.nameLabel}</Label>
          <Input
            id="nombre"
            placeholder={texts.namePlaceholder}
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1"
            style={{ fontFamily: styles.fontFamily }}
            disabled={!!pendingAudio}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="parentezco">{texts.relationLabel}</Label>
          <Input
            id="parentezco"
            placeholder={texts.relationPlaceholder}
            value={relation}
            onChange={e => setRelation(e.target.value)}
            className="mt-1"
            style={{ fontFamily: styles.fontFamily }}
            disabled={!!pendingAudio}
          />
        </div>
        {!pendingAudio ? (
          <AudioRecorder
            onAudioPublished={handleAudioReady}
            key={`recorder-${name}-${relation}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="font-medium" style={{ color: styles.primaryColor }}>
              {texts.audioReady}
            </span>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={handlePublish}
                disabled={!canPublish}
                style={{
                  background: styles.primaryColor,
                  color: "#fff",
                  borderRadius: styles.borderRadius,
                }}
              >
                {texts.publishButton}
              </Button>
              <Button
                variant="outline"
                onClick={handleDiscard}
                style={{
                  borderColor: "#F87171",
                  color: "#F87171",
                  background: styles.secondaryColor,
                  borderRadius: styles.borderRadius,
                }}
              >
                {texts.discardButton}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Historias publicadas */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center" style={{ color: styles.primaryColor }}>
          {texts.publishedStoriesTitle}
        </h3>
        <div className="space-y-4">
          {stories.length === 0 && (
            <p className="text-gray-400 text-center text-sm">{texts.noStories}</p>
          )}
          {stories.map((story) => (
            <div
              key={story.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
              style={{
                borderColor: styles.borderColor,
                borderRadius: styles.borderRadius,
                fontFamily: styles.fontFamily,
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="font-semibold text-gray-700">{story.name}</span>
                <span className="text-gray-400 text-xs">({story.relation})</span>
              </div>
              <audio
                src={story.audioUrl}
                controls
                className="w-full mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-400 text-center" style={{ fontFamily: styles.fontFamily }}>
        <p>{texts.footerMain}</p>
        <p>{texts.footerSub}</p>
      </div>
    </div>
  );
};

export default WordPressEmbed;
