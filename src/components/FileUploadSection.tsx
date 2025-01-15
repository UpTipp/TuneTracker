import { FileInput, Label, Button } from "flowbite-react";

interface FileUploadSectionProps {
  files: File[];
  fileURLs: string[];
  onFileAdd: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadSection = ({
  files,
  fileURLs,
  onFileAdd,
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
    </div>
  );
};

export default FileUploadSection;
