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
        playing={false}
        width="100%"
        height="50px"
      />
    </div>
  );
};

export default AudioPlayer;
