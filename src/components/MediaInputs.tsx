import { Button } from "flowbite-react";
import FileUploadSection from "./FileUploadSection";
import AudioRecorder from "./AudioRecorder";
import AudioPlayer from "./AudioPlayer";

const MediaInputs = ({ setFiles, setFileURLs, files, fileURLs }) => {
  const handleRecordingComplete = (file: File, url: string) => {
    setFiles((prev) => [...prev, file]);
    setFileURLs((prev) => [...prev, url]);
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
    setFiles(files.filter((_, i) => i !== index));
    const urlToRemove = fileURLs[index];
    setFileURLs(fileURLs.filter((_, i) => i !== index));
    // Revoke the URL to free up memory
    URL.revokeObjectURL(urlToRemove);
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

export default MediaInputs;
