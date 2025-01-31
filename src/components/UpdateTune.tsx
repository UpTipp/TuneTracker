import { useState, useEffect } from "react";
import {
  Button,
  Textarea,
  Select,
  Label,
  Modal,
  TextInput,
  Checkbox,
  Dropdown,
} from "flowbite-react";
import MediaInputsUpload from "./MediaInputsUpload";
import LinksSection from "./LinksSection";
import { TUNE_TYPES, TUNE_KEYS } from "../shared/TuneOptions";

const UpdateTune = ({ type, itemId, tune, dataFetch }) => {
  // Modal Setup
  const [openModal, setOpenModal] = useState(false);

  // Inputs Setup
  const [tuneName, setTuneName] = useState(tune.tuneName);
  const [author, setAuthor] = useState(tune.author || "");
  const [tuneType, setTuneType] = useState(tune.tuneType);
  const [tuneKey, setTuneKey] = useState<string[]>(tune.tuneKey || []);
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
    setTuneKey(tune.tuneKey || []);
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

  function handleKeyChange(selectedKey: string) {
    setTuneKey((prevKeys) =>
      prevKeys.includes(selectedKey)
        ? prevKeys.filter((k) => k !== selectedKey)
        : [...prevKeys, selectedKey]
    );
  }

  // Sending the Data
  const handleUpdateTune = async () => {
    const formData = new FormData();
    formData.append("tuneName", tuneName);
    formData.append("tuneType", tuneType);
    formData.append("tuneKey", JSON.stringify(tuneKey));
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
      setTimeout(() => {
        dataFetch();
      }, 1000);
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
                {TUNE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            {/* Tune Key */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="tuneKey" value="Key of Tune" />
                {!tuneKey ||
                  (tuneKey.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Keys: None
                    </p>
                  ))}
                {tuneKey.length > 0 && tuneKey.length < 12 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keys: {tuneKey.join(", ")}
                  </p>
                )}
                {tuneKey.length >= 12 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keys: {tuneKey.slice(0, 12).join(", ") + "..."}
                  </p>
                )}
              </div>
              <Dropdown
                label="Select Keys"
                placement="bottom"
                className="max-h-48 overflow-y-auto"
              >
                {TUNE_KEYS.map((keyOption) => (
                  <Dropdown.Item key={keyOption}>
                    <Checkbox
                      checked={tuneKey.includes(keyOption)}
                      onChange={() => handleKeyChange(keyOption)}
                      id={keyOption}
                    >
                      {keyOption}
                    </Checkbox>
                  </Dropdown.Item>
                ))}
              </Dropdown>
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

            {/* Media Inputs */}
            <MediaInputsUpload
              files={files}
              fileURLs={fileURLs}
              fileCommands={fileCommands}
              setFiles={setFiles}
              setFileURLs={setFileURLs}
              setFileCommands={setFileCommands}
              recordingRefLen={tune.recordingRef.length}
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
