import { useState, useRef } from "react";
import {
  Button,
  Textarea,
  Select,
  FileInput,
  Label,
  Modal,
  TextInput,
} from "flowbite-react";
import FileUploadSection from "./FileUploadSection";
import LinksSection from "./LinksSection";
import AudioRecorder from "./AudioRecorder";
import AudioPlayer from "./AudioPlayer";

const NewTune = ({ dataFetch }) => {
  const [openModal, setOpenModal] = useState(false);

  // Inputs
  const [tuneName, setTuneName] = useState("");
  const [tuneType, setTuneType] = useState("Reel");
  const [tuneKey, setTuneKey] = useState("");
  const [author, setAuthor] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  const [fileURLs, setFileURLs] = useState<string[]>([]);

  const handleRecordingComplete = (file: File, url: string) => {
    setFiles((prev) => [...prev, file]);
    setFileURLs((prev) => [...prev, url]);
  };

  function onCloseModal() {
    setOpenModal(false);
    setTuneType("Reel");
    setTuneKey("");
    setTuneName("");
    setAuthor("");
    setLinks([]);
    setLinkInput("");
    setFiles([]);
    setComments("");
    setFileURLs([]);
  }

  const addLink = () => {
    if (linkInput.trim() !== "") {
      setLinks([...links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const addFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setFiles([...files, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setFileURLs((prevURLs) => [...prevURLs, reader.result as string]);
        };
      });
    }
    event.target.value = ""; // Clear the input value to allow re-uploading the same file
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    const urlToRemove = fileURLs[index];
    setFileURLs(fileURLs.filter((_, i) => i !== index));
    // Revoke the URL to free up memory
    URL.revokeObjectURL(urlToRemove);
  };

  async function onAddTune() {
    const formData = new FormData();
    formData.append("tuneName", tuneName);
    formData.append("tuneType", tuneType);
    formData.append("tuneKey", tuneKey);
    formData.append("author", author);
    formData.append("comments", comments);
    links.forEach((link, index) => {
      formData.append(`links[${index}]`, link);
    });
    files.forEach((file, index) => {
      formData.append(`recordings`, file);
    });

    console.log(formData);

    try {
      const response = await fetch("/api/tunes", {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: {
          // Ensure the server interprets the request correctly
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      dataFetch();
      setOpenModal(false);
      onCloseModal();
    } catch (error) {
      console.error("Error:", error);
      // You might want to show an error message to the user here
    }
  }

  return (
    <>
      <Button
        className="bg-blue-400 ml-2 mr-2"
        onClick={() => setOpenModal(true)}
      >
        Add Tune
      </Button>
      <Modal show={openModal} size="xl" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Add a Tune!
            </h3>

            {/* Tune Name */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="tuneName" value="Tune Name" />
              </div>
              <TextInput
                id="tuneName"
                value={tuneName}
                onChange={(event) => setTuneName(event.target.value)}
                required
              />
            </div>

            {/* Tune Type */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="tuneType" value="Type of Tune" />
              </div>
              <Select
                id="tuneType"
                value={tuneType}
                onChange={(event) => setTuneType(event.target.value)}
                required
              >
                <option value="Reel">Reel</option>
                <option value="Jig">Jig</option>
                <option value="Hornpipe">Hornpipe</option>
                <option value="Slip Jig">Slip Jig</option>
                <option value="Polka">Polka</option>
                <option value="Slide">Slide</option>
                <option value="Waltz">Waltz</option>
                <option value="Mazurka">Mazurka</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            {/* Tune Key */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="tuneKey" value="Key of Tune" />
              </div>
              <Select
                id="tuneKey"
                value={tuneKey}
                onChange={(event) => setTuneKey(event.target.value)}
                required
              >
                <option value=""></option>
                <option value="C#">C#</option>
                <option value="A#m">A#m</option>
                <option value="F#">F#</option>
                <option value="D#m">D#m</option>
                <option value="B">B</option>
                <option value="G#m">G#m</option>
                <option value="E">E</option>
                <option value="C#m">C#m</option>
                <option value="A">A</option>
                <option value="F#m">C#m</option>
                <option value="D">D</option>
                <option value="Bm">Bm</option>
                <option value="G">G</option>
                <option value="Em">Em</option>
                <option value="C">C</option>
                <option value="Am">Am</option>
                <option value="F">F</option>
                <option value="Dm">Dm</option>
                <option value="Bb">Bb</option>
                <option value="Gm">Gm</option>
                <option value="Eb">Eb</option>
                <option value="Cm">Cm</option>
                <option value="Ab">Ab</option>
                <option value="Fm">Fm</option>
                <option value="Db">Db</option>
                <option value="Bbm">Bbm</option>
                <option value="Gb">Gb</option>
                <option value="Ebm">Ebm</option>
                <option value="Cb">Cb</option>
                <option value="Abm">Abm</option>

                <option value="Other">Other</option>
              </Select>
            </div>

            {/* Author */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="author" value="Author" />
              </div>
              <TextInput
                id="author"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
              />
            </div>

            <LinksSection
              links={links}
              linkInput={linkInput}
              onLinkInputChange={setLinkInput}
              onAddLink={addLink}
              onRemoveLink={removeLink}
            />
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

            {/* Comments */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="comments" value="Comment(s)" />
              </div>
              <Textarea
                id="comments"
                value={comments}
                placeholder="Comment(s)..."
                onChange={(event) => setComments(event.target.value)}
                rows={4}
              />
            </div>
            <div className="w-full justify-center">
              <Button onClick={onAddTune}>Add Tune</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewTune;
