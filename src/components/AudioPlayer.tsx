import { useRef, useEffect } from "react";

interface AudioPlayerProps {
  url: string;
  className?: string;
  baseUrl?: string;
}

const AudioPlayer = ({
  url,
  className = "",
  baseUrl = "https://music.charlescrossan.com/",
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fullUrl = url.startsWith("http") ? url : baseUrl + url;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Reset audio element when URL changes
      audio.load();

      // Add event listeners for debugging
      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
      });

      audio.addEventListener("loadstart", () => {
        console.log("Audio load started");
      });

      audio.addEventListener("canplay", () => {
        console.log("Audio can play");
      });
    }

    return () => {
      if (audio) {
        audio.removeEventListener("error", () => {});
        audio.removeEventListener("loadstart", () => {});
        audio.removeEventListener("canplay", () => {});
      }
    };
  }, [fullUrl]);

  return (
    <div className={className}>
      <audio ref={audioRef} controls preload="metadata" className="w-full h-8">
        <source src={fullUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
