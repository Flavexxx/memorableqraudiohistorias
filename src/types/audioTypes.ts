
export interface AudioRecorderProps {
  onAudioPublished?: (audioBlob: Blob) => void;
}

export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isPlaying: boolean;
  recordingTime: number;
  recordingComplete: boolean;
}
