import { useState } from "react";
import { Button, Textarea, Label, Modal, TextInput } from "flowbite-react";
import { arrayMove } from "@dnd-kit/sortable";
import SearchDropdown from "./SearchDropdown";
import DraggableList from "./DraggableList";
import FileUploadSection from "./FileUploadSection";
import LinksSection from "./LinksSection";
import AudioRecorder from "./AudioRecorder";
import AudioPlayer from "./AudioPlayer";

const NewSession = ({ dataFetch, userTunes, userSets }) => {
  const [openModal, setOpenModal] = useState(false);

  // Inputs
  const [sessionName, setSessionName] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  const [fileURLs, setFileURLs] = useState<string[]>([]);
  const [tuneSearch, setTuneSearch] = useState("");
  const [tunes, setTunes] = useState<{ tuneId: string; tuneName: string }[]>(
    []
  );
  const [filteredTunes, setFilteredTunes] = useState(userTunes);
  const [showDropdown, setShowDropdown] = useState(false);

  const [setSearch, setSetSearch] = useState("");
  const [sets, setSets] = useState<{ setId: string; setName: string }[]>([]);
  const [filteredSets, setFilteredSets] = useState(userSets);
  const [showSetDropdown, setShowSetDropdown] = useState(false);

  function onCloseModal() {
    setOpenModal(false);
    setSessionName("");
    setLinks([]);
    setLinkInput("");
    setFiles([]);
    setComments("");
    setFileURLs([]);
    setTunes([]);
    setTuneSearch("");
    setFilteredTunes([]);
    setSets([]);
    setSetSearch("");
    setFilteredSets([]);
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
    setFileURLs(fileURLs.filter((_, i) => i !== index));
  };

  const handleTuneSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setTuneSearch(searchValue);
    setShowDropdown(true);
    const query = searchValue.toLowerCase();

    // Filter tunes that haven't already been added
    const availableTunes = userTunes.filter(
      (tune) => !tunes.some((addedTune) => addedTune.tuneId === tune.tuneId)
    );

    // Show all available tunes if query is empty, otherwise filter by name
    if (query.trim() === "") {
      setFilteredTunes(availableTunes);
    } else {
      const filtered = availableTunes.filter((tune) =>
        tune.tuneName.toLowerCase().includes(query)
      );
      setFilteredTunes(filtered);
    }
  };

  const handleSetSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSetSearch(searchValue);
    setShowSetDropdown(true);
    const query = searchValue.toLowerCase();

    const availableSets = userSets.filter(
      (set) => !sets.some((addedSet) => addedSet.setId === set.setId)
    );

    if (query.trim() === "") {
      setFilteredSets(availableSets);
    } else {
      const filtered = availableSets.filter((set) =>
        set.setName.toLowerCase().includes(query)
      );
      setFilteredSets(filtered);
    }
  };

  const handleInputBlur = () => {
    // Small delay to allow click events on dropdown items to fire
    setTimeout(() => {
      setShowDropdown(false);
      setShowSetDropdown(false);
    }, 200);
  };

  const addTune = (tune: { tuneId: string; tuneName: string }) => {
    setTunes([...tunes, tune]);
    setTuneSearch("");
    setFilteredTunes([]);
  };

  const addSet = (set: { setId: string; setName: string }) => {
    setSets([...sets, set]);
    setSetSearch("");
    setFilteredSets([]);
  };

  const removeTune = (tuneId: string) => {
    setTunes(tunes.filter((tune) => tune.tuneId !== tuneId));
  };

  const removeSet = (setId: string) => {
    setSets(sets.filter((set) => set.setId !== setId));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTunes((items) => {
        const oldIndex = items.findIndex((item) => item.tuneId === active.id);
        const newIndex = items.findIndex((item) => item.tuneId === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRecordingComplete = (file: File, url: string) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    setFileURLs((prevURLs) => [...prevURLs, url]);
  };

  async function onAddSession() {
    const formData = new FormData();
    formData.append("sessionName", sessionName);
    formData.append("comments", comments);
    links.forEach((link, index) => {
      formData.append(`links[${index}]`, link);
    });
    files.forEach((file, index) => {
      formData.append(`recordings`, file);
    });
    tunes.forEach((tune, index) => {
      formData.append(`tunes[${index}]`, tune.tuneId);
    });
    sets.forEach((set, index) => {
      formData.append(`sets[${index}]`, set.setId);
    });

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: {
          Accept: "application/json",
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
  }

  const isFormValid = () => {
    return sessionName.trim() !== "" && tunes.length + sets.length >= 2;
  };

  return (
    <>
      <Button
        className="bg-blue-400 ml-2 mr-2"
        onClick={() => setOpenModal(true)}
      >
        Add Session
      </Button>
      <Modal show={openModal} size="xl" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Add a Session!
            </h3>

            {/* Session Name */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="sessionName" value="Session Name" />
              </div>
              <TextInput
                id="sessionName"
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                required
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

            <SearchDropdown
              label="Search Tunes"
              searchValue={tuneSearch}
              onSearchChange={handleTuneSearch}
              onBlur={handleInputBlur}
              onFocus={() => setShowDropdown(true)}
              showDropdown={showDropdown}
              items={filteredTunes.map((tune) => ({
                id: tune.tuneId,
                name: tune.tuneName,
              }))}
              onItemSelect={(item) =>
                addTune({ tuneId: item.id, tuneName: item.name })
              }
              placeholder="Type to search tunes..."
            />

            <DraggableList
              items={tunes.map((tune) => ({
                id: tune.tuneId,
                name: tune.tuneName,
              }))}
              label="Selected Tunes:"
              onDragEnd={handleDragEnd}
              onRemove={removeTune}
            />

            <SearchDropdown
              label="Search Sets"
              searchValue={setSearch}
              onSearchChange={handleSetSearch}
              onBlur={handleInputBlur}
              onFocus={() => setShowSetDropdown(true)}
              showDropdown={showSetDropdown}
              items={filteredSets.map((set) => ({
                id: set.setId,
                name: set.setName,
              }))}
              onItemSelect={(item) =>
                addSet({ setId: item.id, setName: item.name })
              }
              placeholder="Type to search sets..."
            />

            <DraggableList
              items={sets.map((set) => ({ id: set.setId, name: set.setName }))}
              label="Selected Sets:"
              onDragEnd={handleDragEnd}
              onRemove={removeSet}
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
              {isFormValid() ? (
                <Button onClick={onAddSession}>Add Session</Button>
              ) : (
                <Button disabled onClick={onAddSession}>
                  Add Session
                </Button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewSession;
