import { Button } from "flowbite-react";
import FileUploadSection from "./FileUploadSection";
import AudioRecorder from "./AudioRecorder";
import AudioPlayer from "./AudioPlayer";

const MediaInputs = ({ setFiles, setFileURLs, files, fileURLs }) => {
  const handleRecordingComplete = (file: File, url: string) => {
    setFiles((prev) => [...prev, file]);
    setFileURLs((prev) => [...prev, url]);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const convertedFiles = await Promise.all(
      Array.from(e.target.files).map(async (file) => {
        if (file.type.includes("video")) {
          const formData = new FormData();
          formData.append("file", file);
          try {
            const res = await fetch("/api/extract-audio", {
              method: "POST",
              body: formData,
            });
            if (!res.ok) throw new Error("Failed to convert video to audio");
            const mp3Blob = await res.blob();
            return new File([mp3Blob], "converted.mp3", { type: "audio/mp3" });
          } catch (err) {
            console.error(err);
            return file; // fallback to original
          }
        }
        return file;
      })
    );

    const validFiles = convertedFiles.filter((f) => f) as File[];
    setFiles([...files, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFileURLs((prevURLs) => [...prevURLs, reader.result as string]);
      };
    });

    e.target.value = "";
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
        onFileAdd={handleFiles}
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
