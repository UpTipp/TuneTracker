import ReactPlayer from "react-player";

interface AudioPlayerProps {
  url: string;
  className?: string;
}

const AudioPlayer = ({ url, className = "" }: AudioPlayerProps) => {
  return (
    <ReactPlayer
      className={className}
      url={url}
      controls
      playsinline
      config={{
        file: {
          attributes: {
            preload: "metadata",
            controlsList: "nodownload",
          },
        },
      }}
    />
  );
};

export default AudioPlayer;
