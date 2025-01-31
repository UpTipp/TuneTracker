import { useState } from "react";
import { Button, Textarea, Label, Modal, TextInput } from "flowbite-react";
import { arrayMove } from "@dnd-kit/sortable";
import SearchDropdown from "./SearchDropdown";
import LinksSection from "./LinksSection";
import DraggableList from "./DraggableList";
import MediaInputsUpload from "./MediaInputsUpload";

const UpdateSession = ({
  type,
  itemId,
  session,
  dataFetch,
  userTunes,
  userSets,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [sessionName, setSessionName] = useState(session.sessionName);
  const [links, setLinks] = useState<string[]>(session.links || []);
  const [linkInput, setLinkInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState(session.creatorComments || "");
  const [fileURLs, setFileURLs] = useState<string[]>(
    session.recordingRef || []
  );
  const [fileCommands, setFileCommands] = useState<string[]>(
    Array(session.recordingRef?.length || 0).fill("keep")
  );
  const [tunes, setTunes] = useState(session.tunes || []);
  const [sets, setSets] = useState(session.sets || []);
  const [tuneSearch, setTuneSearch] = useState("");
  const [setSearch, setSetSearch] = useState("");
  const [filteredTunes, setFilteredTunes] = useState(userTunes);
  const [filteredSets, setFilteredSets] = useState(userSets);
  const [showDropdown, setShowDropdown] = useState(false);

  function onCloseModal() {
    setOpenModal(false);
    setSessionName(session.sessionName);
    setLinks(session.links || []);
    setLinkInput("");
    setFiles([]);
    setComments(session.creatorComments || "");
    setFileURLs(session.recordingRef || []);
    setFileCommands(Array(session.recordingRef?.length || 0).fill("keep"));
    setTunes(session.tunes || []);
    setSets(session.sets || []);
  }

  const handleUpdateSession = async () => {
    const formData = new FormData();
    formData.append("sessionName", sessionName);
    formData.append("comments", comments);
    formData.append("fileCommands", JSON.stringify(fileCommands));
    links.forEach((link, index) => {
      formData.append(`links[${index}]`, link);
    });
    files.forEach((file) => {
      formData.append("recordings", file);
    });
    tunes.forEach((tune, index) => {
      formData.append(`tunes[${index}]`, tune.tuneId);
    });
    sets.forEach((set, index) => {
      formData.append(`sets[${index}]`, set.setId);
    });

    try {
      const response = await fetch(`/api/sessions/${itemId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      console.log("Success:", result);
      setTimeout(() => {
        dataFetch();
      }, 1000);
      onCloseModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleTuneSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setTuneSearch(searchValue);
    setShowDropdown(true);
    const query = searchValue.toLowerCase();

    const availableTunes = userTunes.filter(
      (tune) => !tunes.some((addedTune) => addedTune.tuneId === tune.tuneId)
    );

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
    setShowDropdown(true);
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
    setTimeout(() => {
      setShowDropdown(false);
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

  const handleDragEndTunes = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTunes((items) => {
        const oldIndex = items.findIndex((item) => item.tuneId === active.id);
        const newIndex = items.findIndex((item) => item.tuneId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndSets = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSets((items) => {
        const oldIndex = items.findIndex((item) => item.setId === active.id);
        const newIndex = items.findIndex((item) => item.setId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addLink = () => {
    if (linkInput.trim() !== "") {
      setLinks([...links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    return sessionName.trim() !== "" && tunes.length + sets.length >= 2;
  };

  return (
    <>
      <Button className="bg-blue-400" onClick={() => setOpenModal(true)}>
        Update {String(type).charAt(0).toUpperCase() + String(type).slice(1)}
      </Button>
      <Modal show={openModal} size="xl" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Editing Session
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

            {/* Media Inputs */}
            <MediaInputsUpload
              files={files}
              fileURLs={fileURLs}
              fileCommands={fileCommands}
              setFiles={setFiles}
              setFileURLs={setFileURLs}
              setFileCommands={setFileCommands}
              recordingRefLen={session.recordingRef.length}
            />

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
              onDragEnd={handleDragEndTunes}
              onRemove={removeTune}
            />

            <SearchDropdown
              label="Search Sets"
              searchValue={setSearch}
              onSearchChange={handleSetSearch}
              onBlur={handleInputBlur}
              onFocus={() => setShowDropdown(true)}
              showDropdown={showDropdown}
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
              onDragEnd={handleDragEndSets}
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

            {/* Update Button */}
            <div className="w-full justify-center">
              {isFormValid() ? (
                <Button onClick={handleUpdateSession}>Update Session</Button>
              ) : (
                <Button disabled onClick={handleUpdateSession}>
                  Update Session
                </Button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UpdateSession;
