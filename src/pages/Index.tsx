
import AudioRecorder from "@/components/AudioRecorder";
import WordPressEmbed from "@/components/WordPressEmbed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const handleAudioPublished = (audioBlob: Blob) => {
    // Aquí se puede implementar la lógica para subir el audio a WordPress
    // Como ejemplo, mostramos cómo crear un enlace de descarga
    const url = URL.createObjectURL(audioBlob);
    
    alert("¡Audio grabado correctamente!");
    
    // En una implementación real, aquí se enviaría el archivo al servidor
    console.log("Audio listo para ser subido:", url);
    
    // También podríamos crear un elemento para descargarlo
    const a = document.createElement("a");
    a.href = url;
    a.download = "grabacion.webm";
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Grabador de Audio para WordPress</h1>
          <p className="text-gray-600">Graba, escucha y publica mensajes de audio fácilmente</p>
        </div>
        
        <Tabs defaultValue="recorder" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="recorder">Grabador</TabsTrigger>
            <TabsTrigger value="embed">Vista Embed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recorder" className="mt-0">
            <AudioRecorder onAudioPublished={handleAudioPublished} />
          </TabsContent>
          
          <TabsContent value="embed" className="mt-0">
            <div className="border border-gray-200 p-4 rounded-lg bg-white">
              <p className="text-sm text-gray-500 mb-4">
                Vista previa de cómo se verá el widget en WordPress:
              </p>
              <WordPressEmbed />
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Código para Elementor</h3>
              <div className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                <pre>{`[audio_recorder]`}</pre>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Para la integración completa, se necesitaría crear un plugin de WordPress
                que registre este shortcode y cargue los recursos necesarios.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Este grabador de audio puede integrarse con Elementor para WordPress</p>
          <p className="mt-2">Compatible con dispositivos móviles y escritorio</p>
          <p className="mt-2 text-xs">Para la integración completa, es necesario un plugin WordPress que maneje el almacenamiento de los archivos.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
