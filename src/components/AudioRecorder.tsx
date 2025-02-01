import { useReactMediaRecorder } from "react-media-recorder";
import { Button, Label } from "flowbite-react";

interface AudioRecorderProps {
  onRecordingComplete: (file: File, url: string) => void;
}

const AudioRecorder = ({ onRecordingComplete }: AudioRecorderProps) => {
  const { status, startRecording, pauseRecording, stopRecording } =
    useReactMediaRecorder({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 96000,
        channelCount: 2,
      },
      onStop: async (blobUrl, blob) => {
        const file = new File([blob], "recording.mp3", { type: "audio/mp3" });
        const url = URL.createObjectURL(file);
        onRecordingComplete(file, url);
      },
    });

  const handlePauseRecording = () => {
    pauseRecording();
    // No finalization here
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  return (
    <div>
      <div className="mb-2 block">
        <Label value="Record Audio" />
      </div>
      {status === "recording" && (
        <p className="text-green-400">Recording status: Recording...</p>
      )}
      {status === "paused" && (
        <p className="text-orange-400">Recording status: Paused</p>
      )}
      {status !== "recording" && status !== "paused" && (
        <p className="text-red-500">Recording status: Stopped</p>
      )}
      <div className="flex items-center gap-2">
        <Button color="blue" onClick={startRecording}>
          Start
        </Button>
        <Button color="yellow" onClick={handlePauseRecording}>
          Pause
        </Button>
        <Button color="red" onClick={handleStopRecording}>
          Stop
        </Button>
      </div>
    </div>
  );
};

export default AudioRecorder;
