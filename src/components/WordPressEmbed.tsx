
import React, { useState, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Story {
  audioUrl: string;
  audioBlob: Blob;
  name: string;
  relation: string;
  id: string; // Agregamos un ID único para cada historia
}

const WordPressEmbed: React.FC = () => {
  // Estados para los campos del formulario
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  // Audio temporal antes de publicar
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  // Lista de historias publicadas
  const [stories, setStories] = useState<Story[]>([]);
  const { toast } = useToast();

  // Se llama cuando se graba un audio, pero aún no se publica
  const handleAudioReady = (audioBlob: Blob) => {
    setPendingAudio(audioBlob);
  };

  // Publica el audio junto con los datos del formulario
  const handlePublish = () => {
    if (!name.trim() || !relation.trim() || !pendingAudio) return;
    
    const audioUrl = URL.createObjectURL(pendingAudio);
    const newStory: Story = {
      audioUrl,
      audioBlob: pendingAudio,
      name,
      relation,
      id: Date.now().toString(), // Generamos un ID único basado en timestamp
    };

    setStories(prevStories => [newStory, ...prevStories]);
    
    // Mostrar toast de confirmación
    toast({
      title: "Historia publicada",
      description: `La historia de ${name} ha sido publicada exitosamente.`,
    });
    
    // Limpiar estados
    setPendingAudio(null);
    setName("");
    setRelation("");
  };

  // Descartar audio antes de publicar
  const handleDiscard = () => {
    setPendingAudio(null);
  };

  // Validación: ambos campos y un audio listos
  const canPublish = name.trim() && relation.trim() && pendingAudio;

  return (
    <div className="wordpress-audio-recorder-embed">
      <div className="mb-4 p-4 bg-gray-50 rounded shadow">
        <div className="mb-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            placeholder="Ejemplo: Ana González"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1"
            disabled={!!pendingAudio}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="parentezco">Parentezco</Label>
          <Input
            id="parentezco"
            placeholder="Ejemplo: Hija, Amigo, Esposo..."
            value={relation}
            onChange={e => setRelation(e.target.value)}
            className="mt-1"
            disabled={!!pendingAudio}
          />
        </div>
        {/* Solo muestra el grabador si no hay un audio listo, para forzar llenar los campos antes de grabar */}
        {!pendingAudio ? (
          <AudioRecorder
            onAudioPublished={handleAudioReady}
            key={`${name}-${relation}`} // reset si cambian los campos
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-green-700 font-medium">Audio listo para publicar</span>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={handlePublish}
                disabled={!canPublish}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Publicar
              </Button>
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="border-red-300 text-red-500 hover:bg-red-50"
              >
                Descartar
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Historias publicadas */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">Historias publicadas</h3>
        <div className="space-y-4">
          {stories.length === 0 && (
            <p className="text-gray-400 text-center text-sm">No hay historias publicadas aún.</p>
          )}
          {stories.map((story) => (
            <div
              key={story.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
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

      <div className="mt-8 text-xs text-gray-400 text-center">
        <p>Grabador de audio para WordPress</p>
        <p>Puedes grabar, revisar y publicar historias en homenaje</p>
      </div>
    </div>
  );
};

export default WordPressEmbed;
