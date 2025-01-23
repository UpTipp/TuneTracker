import { useReactMediaRecorder } from "react-media-recorder";
import { Button, Label } from "flowbite-react";

interface AudioRecorderProps {
  onRecordingComplete: (file: File, url: string) => void;
}

const AudioRecorder = ({ onRecordingComplete }: AudioRecorderProps) => {
  const {
    status,
    startRecording,
    stopRecording,
    pauseRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ audio: true });

  const handleStopRecording = async () => {
    stopRecording();
    // Wait a moment for the blob to finalize
    setTimeout(async () => {
      const response = await fetch(mediaBlobUrl || "");
      const blob = await response.blob();
      const file = new File([blob], "recording.mp3", { type: "audio/mp3" });
      const url = URL.createObjectURL(file);
      onRecordingComplete(file, url);
    }, 500);
  };

  return (
    <div>
      <div className="mb-2 block">
        <Label value="Record Audio" />
      </div>
      <p>Recording status: {status}</p>
      <div className="flex items-center gap-2">
        <Button color="blue" onClick={startRecording}>
          Start
        </Button>
        <Button color="yellow" onClick={pauseRecording}>
          Pause
        </Button>
        <Button color="red" onClick={handleStopRecording}>
          Stop
        </Button>
        {mediaBlobUrl && (
          <audio src={mediaBlobUrl} controls style={{ display: "inline" }} />
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
