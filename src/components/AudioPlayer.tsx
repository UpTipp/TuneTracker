import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";

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
  const [useNativePlayer, setUseNativePlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fullUrl = url.startsWith("http") ? url : baseUrl + url;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [fullUrl]);

  const handleReactPlayerError = () => {
    console.log("ReactPlayer failed, falling back to native audio");
    setUseNativePlayer(true);
  };

  return useNativePlayer ? (
    // Native HTML5 Audio Player
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
  ) : (
    // React Player with fallback
    <ReactPlayer
      url={fullUrl}
      controls
      playsinline
      width="100%"
      height="30px"
      onError={handleReactPlayerError}
      config={{
        file: {
          forceAudio: true,
          attributes: {
            controlsList: "nodownload",
            playsInline: true,
            preload: "metadata",
          },
        },
      }}
      fallback={
        <audio
          controls
          controlsList="nodownload"
          preload="metadata"
          className="w-full"
        >
          <source src={fullUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      }
      className={className}
    />
  );
};

export default AudioPlayer;
