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
  const fullUrl = url.startsWith("http") ? url : baseUrl + url;

  return (
    <ReactPlayer
      key={fullUrl} // ensures unique re-render if url changes
      url={fullUrl}
      controls
      playsinline
      width="100%"
      height="30px"
      config={{
        file: {
          forceAudio: true,
          attributes: {
            controlsList: "nodownload",
            playsInline: true,
            preload: "metadata", // helps multiple files load correctly
          },
        },
      }}
      fallback={
        <audio controls src={fullUrl} className="w-full">
          Your browser does not support the audio element.
        </audio>
      }
      className={className}
    />
  );
};

export default AudioPlayer;
