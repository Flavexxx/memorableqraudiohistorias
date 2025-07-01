
import React, { useState, useCallback } from 'react';
import SimpleAudioRecorder from './SimpleAudioRecorder';

interface Story {
  audioUrl: string;
  audioBlob: Blob;
  name: string;
  relation: string;
  id: string;
}

const WordPressWidget: React.FC = () => {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  const [stories, setStories] = useState<Story[]>([]);

  const handleAudioReady = useCallback((audioBlob: Blob) => {
    setPendingAudio(audioBlob);
  }, []);

  const handlePublish = useCallback(() => {
    if (!name.trim() || !relation.trim() || !pendingAudio) return;

    const audioUrl = URL.createObjectURL(pendingAudio);
    const newStory: Story = {
      audioUrl,
      audioBlob: pendingAudio,
      name,
      relation,
      id: Date.now().toString(),
    };

    setStories(prevStories => [newStory, ...prevStories]);
    setPendingAudio(null);
    setName("");
    setRelation("");
  }, [name, relation, pendingAudio]);

  const handleDiscard = useCallback(() => {
    setPendingAudio(null);
  }, []);

  const canPublish = name.trim() && relation.trim() && pendingAudio;

  return (
    <div className="hmqr-widget">
      <div className="hmqr-form">
        <div className="hmqr-title">Grabemos juntos su historia</div>
        
        <div className="hmqr-field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            placeholder="Ejemplo: Ana González"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={!!pendingAudio}
          />
        </div>
        
        <div className="hmqr-field">
          <label htmlFor="parentezco">Parentezco</label>
          <input
            id="parentezco"
            type="text"
            placeholder="Ejemplo: Hija, Amigo, Esposo..."
            value={relation}
            onChange={e => setRelation(e.target.value)}
            disabled={!!pendingAudio}
          />
        </div>
        
        {!pendingAudio ? (
          <SimpleAudioRecorder onAudioReady={handleAudioReady} />
        ) : (
          <div className="hmqr-audio-ready">
            <span>Audio listo para publicar</span>
            <div className="hmqr-buttons">
              <button
                className="hmqr-button hmqr-button-primary"
                onClick={handlePublish}
                disabled={!canPublish}
              >
                Publicar
              </button>
              <button
                className="hmqr-button hmqr-button-secondary"
                onClick={handleDiscard}
              >
                Descartar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hmqr-stories">
        <h3>Historias publicadas</h3>
        {stories.length === 0 ? (
          <p className="hmqr-no-stories">No hay historias publicadas aún.</p>
        ) : (
          <div className="hmqr-stories-list">
            {stories.map((story) => (
              <div key={story.id} className="hmqr-story">
                <div className="hmqr-story-header">
                  <span className="hmqr-story-name">{story.name}</span>
                  <span className="hmqr-story-relation">({story.relation})</span>
                </div>
                <audio src={story.audioUrl} controls className="hmqr-audio" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordPressWidget;
