import { useState, useEffect, useRef } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fullUrl = url.startsWith("http") ? url : baseUrl + url;

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const loadAudio = async () => {
      try {
        // Check if the server supports range requests
        const response = await fetch(fullUrl, {
          method: "HEAD",
        });

        if (!response.ok) {
          throw new Error("Failed to load audio");
        }

        // Reset and load the audio element
        if (audioRef.current) {
          audioRef.current.load();

          audioRef.current.onloadedmetadata = () => {
            setIsLoading(false);
          };

          audioRef.current.onerror = (e) => {
            console.error("Audio loading error:", e);
            setError("Failed to load audio");
            setIsLoading(false);
          };
        }
      } catch (err) {
        console.error("Audio fetch error:", err);
        setError("Failed to load audio");
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [fullUrl]);

  return (
    <div className={className}>
      {isLoading && (
        <div className="text-sm text-gray-500">Loading audio...</div>
      )}
      {error && <div className="text-sm text-red-500">{error}</div>}
      <audio
        ref={audioRef}
        controls
        controlsList="nodownload"
        preload="metadata"
        className={`w-full h-8 ${isLoading ? "invisible" : "visible"}`}
      >
        <source src={fullUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
