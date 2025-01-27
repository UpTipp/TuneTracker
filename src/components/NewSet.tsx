import { useState } from "react";
import { Button, Textarea, Label, Modal, TextInput } from "flowbite-react";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";
import SearchDropdown from "./SearchDropdown";
import DraggableList from "./DraggableList";
import LinksSection from "./LinksSection";
import MediaInputs from "./MediaInputs";
import NewTune from "./NewTune";

const SortableItem = ({ tune, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tune.tuneId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 mb-1 rounded"
    >
      <div
        className="flex items-center flex-grow cursor-move"
        {...attributes}
        {...listeners}
      >
        <MdDragIndicator />
        <span className="ml-2">{tune.tuneName}</span>
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(tune.tuneId);
        }}
        className="ml-2"
        size="xs"
        color="red"
      >
        Remove
      </Button>
    </div>
  );
};

const NewSet = ({ dataFetch, userTunes, goTo }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTunes, setSelectedTunes] = useState([]);

  // Inputs
  const [setName, setSetName] = useState("");
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

  function onCloseModal() {
    setOpenModal(false);
    setSetName("");
    setLinks([]);
    setLinkInput("");
    setFiles([]);
    setComments("");
    setFileURLs([]);
    setTunes([]);
    setTuneSearch("");
    setFilteredTunes([]);
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

  const handleInputBlur = () => {
    // Small delay to allow click events on dropdown items to fire
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const addTune = (tune: { tuneId: string; tuneName: string }) => {
    setTunes([...tunes, tune]);
    setTuneSearch("");
    setFilteredTunes([]);
  };

  const removeTune = (tuneId: string) => {
    console.log(tuneId);
    // Changed parameter from index to tuneId
    setTunes(tunes.filter((tune) => tune.tuneId !== tuneId));
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

  async function onAddSet() {
    const formData = new FormData();
    formData.append("setName", setName);
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

    console.log(formData);

    try {
      const response = await fetch("/api/sets", {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: {
          // Ensure the server interprets the request correctly
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

      let setId = result.setId;
      setTimeout(() => {
        goTo("set", setId);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Add this new function to check form validity
  const isFormValid = () => {
    return setName.trim() !== "" && tunes.length >= 2;
  };

  function handleTuneCreated(newTune) {
    setSelectedTunes((prev) => [...prev, newTune]);
  }

  return (
    <>
      <Button
        className="bg-blue-400 ml-2 mr-2"
        onClick={() => setOpenModal(true)}
      >
        Add Set
      </Button>
      <Modal show={openModal} size="xl" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Add a Set!
            </h3>

            {/* Set Name */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="setName" value="Set Name" />
              </div>
              <TextInput
                id="setName"
                value={setName}
                onChange={(event) => setSetName(event.target.value)}
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

            {/* Files */}
            <MediaInputs
              files={files}
              fileURLs={fileURLs}
              setFiles={setFiles}
              setFileURLs={setFileURLs}
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
              onDragEnd={handleDragEnd}
              onRemove={removeTune}
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
                <Button onClick={onAddSet}>Add Set</Button>
              ) : (
                <Button disabled onClick={onAddSet}>
                  Add Set
                </Button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <NewTune
        dataFetch={dataFetch}
        goTo={goTo}
        onTuneCreated={(tune) => {
          handleTuneCreated(tune);
        }}
      />
    </>
  );
};

export default NewSet;
