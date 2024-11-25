import { useState, useEffect } from "react";
import {
  Button,
  Textarea,
  Select,
  FileInput,
  Label,
  Modal,
  TextInput,
} from "flowbite-react";
import ReactPlayer from "react-player";
import { set } from "mongoose";
import FileUploadSection from "./FileUploadSection";
import LinksSection from "./LinksSection";
import AudioRecorder from "./AudioRecorder";

const UpdateTune = ({ type, itemId, tune, dataFetch }) => {
  // Modal Setup
  const [openModal, setOpenModal] = useState(false);

  // Inputs Setup
  const [tuneName, setTuneName] = useState(tune.tuneName);
  const [author, setAuthor] = useState(tune.author || "");
  const [tuneType, setTuneType] = useState(tune.tuneType);
  const [tuneKey, setTuneKey] = useState(tune.tuneKey || "");
  const [links, setLinks] = useState<string[]>(tune.link || []);
  const [linkInput, setLinkInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState(tune.creatorComments || "");
  const [fileURLs, setFileURLs] = useState<string[]>(tune.recordingRef || []);
  const [fileCommands, setFileCommands] = useState<string[]>(
    Array(tune.recordingRef.length).fill("keep")
  );

  useEffect(() => {
    if (tune.recordingRef && tune.recordingRef.length > 0) {
      const fetchFiles = async () => {
        const fetchedFiles = await Promise.all(
          tune.recordingRef.map(async (url) => {
            const response = await fetch(url);
            const data = await response.blob();
            return new File([data], url.split("/").pop() || "file");
          })
        );
      };
      fetchFiles();
    }
  }, [tune.recordingRef]);

  // Closing the Modal
  function onCloseModal() {
    setOpenModal(false);
    setTuneName(tune.tuneName);
    setTuneType(tune.tuneType);
    setTuneKey(tune.tuneKey || "");
    setAuthor(tune.author || "");
    setLinks(tune.links || []);
    setLinkInput("");
    setFiles([]);
    setComments(tune.creatorComments || "");
    setFileURLs(
      tune.recordingRef.filter(
        (_, index) => fileCommands[index] !== "delete"
      ) || []
    );
    setFileCommands(Array(tune.recordingRef.length).fill("keep"));
    setFileURLs(
      tune.recordingRef.filter(
        (_, index) => fileCommands[index] !== "delete"
      ) || []
    );
  }

  // Updating Files and Links
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
      setFileCommands([
        ...fileCommands,
        ...Array(newFiles.length).fill("keep"),
      ]);

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
    if (index < tune.recordingRef.length) {
      // Existing file, set command to "delete"
      const newCommands = [...fileCommands];
      newCommands[index] = "delete";
      setFileCommands(newCommands);
      setFileURLs(fileURLs.filter((_, i) => i !== index));
    } else {
      // New file, remove from files and fileURLs
      const newIndex = index - tune.recordingRef.length;
      setFiles(files.filter((_, i) => i !== newIndex));
      setFileURLs(fileURLs.filter((_, i) => i !== index));
      setFileCommands(fileCommands.filter((_, i) => i !== index));
    }
  };

  const handleFileCommandChange = (index: number, command: string) => {
    const newCommands = [...fileCommands];
    newCommands[index] = command;
    setFileCommands(newCommands);
  };

  const handleRecordingComplete = (file: File, url: string) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    setFileURLs((prevURLs) => [...prevURLs, url]);
  };

  // Sending the Data
  const handleUpdateTune = async () => {
    const formData = new FormData();
    formData.append("tuneName", tuneName);
    formData.append("tuneType", tuneType);
    formData.append("tuneKey", tuneKey);
    formData.append("author", author);
    formData.append("comments", comments);
    formData.append("fileCommands", JSON.stringify(fileCommands));
    links.forEach((link, index) => {
      formData.append(`links[${index}]`, link);
    });
    files.forEach((file, index) => {
      formData.append(`recordings`, file);
    });

    try {
      const response = await fetch("/api/tunes/" + itemId, {
        method: "PUT",
        body: formData,
        credentials: "include",
        headers: {
          Accept: "application/json",
          tuneId: tune.tuneId, // Adding tuneId as a custom header
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Success:", result);
      dataFetch();
      setOpenModal(false);
      onCloseModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Button className="bg-blue-400" onClick={() => setOpenModal(true)}>
        Update {String(type).charAt(0).toUpperCase() + String(type).slice(1)}
      </Button>
      <Modal
        show={openModal}
        size="xl"
        onClose={onCloseModal}
        className="non-clickable"
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Editing Tune
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
              onFileRemove={removeFile}
            />

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
              <Button onClick={handleUpdateTune}>Update Tune</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UpdateTune;
