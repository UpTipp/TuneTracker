import { FileInput, Label, Button } from "flowbite-react";
import ReactPlayer from "react-player";

interface FileUploadSectionProps {
  files: File[];
  fileURLs: string[];
  onFileAdd: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (index: number) => void;
}

const FileUploadSection = ({
  files,
  fileURLs,
  onFileAdd,
  onFileRemove,
}: FileUploadSectionProps) => {
  return (
    <div id="fileUpload" className="max-w-md">
      <div className="mb-2 block">
        <Label htmlFor="file" value="Upload file(s)" />
      </div>
      <FileInput
        id="file"
        name="recordings"
        onChange={onFileAdd}
        helperText="Mp3, Mp4, etc. MAX (10 MB)"
        multiple
      />
      <ul className="mt-2">
        {fileURLs.map((url, index) => (
          <li key={index} className="flex items-center">
            <ReactPlayer
              url={url}
              controls
              playsinline
              style={{ width: "80%", height: "30px" }}
              width="100%"
              height="100%"
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload",
                    playsInline: true,
                  },
                  forceAudio: true,
                },
              }}
              fallback={
                <audio controls src={url} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              }
              className="ml-2"
            />
            <Button
              onClick={() => onFileRemove(index)}
              className="ml-2"
              size="xs"
              color="red"
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploadSection;
