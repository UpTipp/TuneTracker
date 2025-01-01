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
  const fullUrl = url.startsWith("http") ? url : baseUrl + url;

  useEffect(() => {
    // Reset audio element when URL changes
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [fullUrl]);

  return (
    <div className={className}>
      <audio
        ref={audioRef}
        controls
        controlsList="nodownload"
        preload="metadata"
        className="w-full h-8"
      >
        <source src={fullUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
