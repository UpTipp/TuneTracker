import ReactPlayer from "react-player";

interface AudioPlayerProps {
  url: string;
  className?: string;
}

const AudioPlayer = ({ url, className = "" }: AudioPlayerProps) => {
  return (
    <div className={className}>
      <ReactPlayer
        url={url}
        controls
        playsinline
        playing={false}
        width="100%"
        height="50px"
        config={{
          file: {
            attributes: {
              preload: "metadata",
              controlsList: "nodownload",
              playsInline: true,
            },
          },
        }}
      />
    </div>
  );
};

export default AudioPlayer;
