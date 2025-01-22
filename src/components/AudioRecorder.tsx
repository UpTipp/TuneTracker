import { useState, useRef, useEffect } from "react";
import { Button, Label } from "flowbite-react";

interface AudioRecorderProps {
  onRecordingComplete: (file: File, url: string) => void;
}

const AudioRecorder = ({ onRecordingComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    if (!window.MediaRecorder) {
      alert("MediaRecorder not supported in this browser.");
    }
  }, []);

  const handleRecord = async () => {
    if (!isRecording) {
      // Start new recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus", // Better cross-browser support
          audioBitsPerSecond: 128000,
        });
        mediaRecorderRef.current = mediaRecorder;
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          // Create blob with proper chunks
          const blob = new Blob(chunks, { type: "audio/mpeg" });

          // Convert to MP3 if needed (you might want to add a conversion step here)
          const file = new File([blob], `recording-${Date.now()}.mp3`, {
            type: "audio/mpeg",
            lastModified: Date.now(),
          });

          const url = URL.createObjectURL(blob);
          onRecordingComplete(file, url);
        };

        // Request data in smaller chunks
        mediaRecorder.start(1000); // capture in 1-second chunks
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
        setIsRecording(false);
      }
    }
  };

  return (
    <div>
      <div className="mb-2 block">
        <Label value="Record Audio" />
      </div>
      <div className="flex items-center gap-2">
        <Button color={isRecording ? "red" : "blue"} onClick={handleRecord}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>
    </div>
  );
};

export default AudioRecorder;
