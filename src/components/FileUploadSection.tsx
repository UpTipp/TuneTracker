import { FileInput, Label, Button } from "flowbite-react";
import ReactPlayer from "react-player";
import AudioPlayer from "./AudioPlayer";

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
            <AudioPlayer url={url} className="ml-2" />
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
