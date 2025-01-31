import { useState } from "react";
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
import LinksSection from "./LinksSection";
import MediaInputs from "./MediaInputs";
import { TUNE_TYPES, TUNE_KEYS } from "../shared/TuneOptions";

interface NewTuneProps {
  onTuneCreated?: (tune: any) => void;
  dataFetch: () => void;
  goTo: (page: string, id: string) => void;
}

const NewTune = ({
  onTuneCreated = () => {},
  dataFetch,
  goTo,
}: NewTuneProps) => {
  const [openModal, setOpenModal] = useState(false);

  // Inputs
  const [tuneName, setTuneName] = useState("");
  const [tuneType, setTuneType] = useState("Reel");
  const [tuneKey, setTuneKey] = useState<string[]>([]);
  const [author, setAuthor] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  const [fileURLs, setFileURLs] = useState<string[]>([]);

  function onCloseModal() {
    setOpenModal(false);
    setTuneType("Reel");
    setTuneKey([]);
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

  function handleKeyChange(selectedKey: string) {
    setTuneKey((prevKeys) =>
      prevKeys.includes(selectedKey)
        ? prevKeys.filter((k) => k !== selectedKey)
        : [...prevKeys, selectedKey]
    );
  }

  async function onAddTune() {
    const formData = new FormData();
    formData.append("tuneName", tuneName);
    formData.append("tuneType", tuneType);
    tuneKey.forEach((key, index) => {
      formData.append(`tuneKey[${index}]`, key);
    });
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
      setTimeout(() => {
        dataFetch();
      }, 1000);
      setOpenModal(false);
      onCloseModal();

      if (onTuneCreated === undefined) {
        let tuneId = result.tuneId;
        setTimeout(() => {
          goTo("tune", tuneId);
        }, 1000);
      } else {
        onTuneCreated(result);
      }
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
                <option value="">Unspecificed</option>
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
                dismissOnClick={false}
                className="max-h-48 overflow-y-auto"
              >
                {TUNE_KEYS.map((keyOption) => (
                  <Dropdown.Item key={keyOption} className="w-full">
                    <div
                      className="flex gap-2 w-full items-center"
                      onClick={() => handleKeyChange(keyOption)}
                    >
                      <Checkbox
                        id={keyOption}
                        checked={tuneKey.includes(keyOption)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <p className="text-slate-800 text-base ">{keyOption}</p>
                    </div>
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

            {/* Links */}
            <LinksSection
              links={links}
              linkInput={linkInput}
              onLinkInputChange={setLinkInput}
              onAddLink={addLink}
              onRemoveLink={removeLink}
            />

            {/* Media Inputs */}
            <MediaInputs
              files={files}
              fileURLs={fileURLs}
              setFiles={setFiles}
              setFileURLs={setFileURLs}
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
              <Button onClick={onAddTune}>Add Tune</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewTune;
