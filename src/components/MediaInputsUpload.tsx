import { Button } from "flowbite-react";
import FileUploadSection from "./FileUploadSection";
import AudioRecorder from "./AudioRecorder";
import AudioPlayer from "./AudioPlayer";

const MediaInputsUpload = ({
  setFiles,
  setFileURLs,
  setFileCommands,
  files,
  fileURLs,
  fileCommands,
  recordingRefLen,
}) => {
  const handleRecordingComplete = (file: File, url: string) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    setFileURLs((prevURLs) => [...prevURLs, url]);
    setFileCommands([...fileCommands, ...Array(1).fill("keep")]);
  };

  const addFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const newFiles = await Promise.all(
      Array.from(event.target.files).map(async (file) => {
        if (file.type.includes("video")) {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/extract-audio", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            console.error("Failed to convert video to audio:", file.name);
            return null;
          }
          const mp3Blob = await res.blob();
          return new File([mp3Blob], "converted.mp3", { type: "audio/mp3" });
        }
        return file;
      })
    );

    const validFiles = newFiles.filter((f) => f) as File[];
    setFiles([...files, ...validFiles]);
    setFileCommands([...fileCommands, ...Array(newFiles.length).fill("keep")]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFileURLs((prevURLs) => [...prevURLs, reader.result as string]);
      };
    });

    event.target.value = "";
  };

  const removeFile = (index: number) => {
    if (index < recordingRefLen) {
      // Existing file, set command to "delete"
      const newCommands = [...fileCommands];
      newCommands[index] = "delete";
      setFileCommands(newCommands);
      setFileURLs(fileURLs.filter((_, i) => i !== index));
    } else {
      // New file, remove from files and fileURLs
      const newIndex = index - recordingRefLen;
      setFiles(files.filter((_, i) => i !== newIndex));
      setFileURLs(fileURLs.filter((_, i) => i !== index));
      setFileCommands(fileCommands.filter((_, i) => i !== index));
    }
  };

  return (
    <>
      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      <FileUploadSection
        files={files}
        fileURLs={fileURLs}
        onFileAdd={addFile}
      />

      {/* Files */}
      <ul className="mt-2">
        {fileURLs.map((url, i) => (
          <li key={i} className="flex items-center">
            <AudioPlayer url={url} className="w-full" />
            <Button
              onClick={() => removeFile(i)}
              className="ml-2"
              size="xs"
              color="red"
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MediaInputsUpload;
