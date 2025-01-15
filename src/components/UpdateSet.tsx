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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";
import SearchDropdown from "./SearchDropdown";
import FileUploadSection from "./FileUploadSection";
import LinksSection from "./LinksSection";
import AudioRecorder from "./AudioRecorder";
import AudioPlayer from "./AudioPlayer";

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
        onClick={() => onRemove(tune.tuneId)}
        className="ml-2"
        size="xs"
        color="red"
      >
        Remove
      </Button>
    </div>
  );
};

const UpdateSet = ({
  type,
  itemId,
  set,
  dataFetch,
  userTunes,
}: {
  type: string;
  itemId: string;
  set: any;
  dataFetch: () => void;
  userTunes: Array<{ tuneId: string; tuneName: string }>;
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [setName, setSetName] = useState(set.setName);
  const [links, setLinks] = useState<string[]>(set.links || []);
  const [linkInput, setLinkInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState(set.creatorComments || "");
  const [fileURLs, setFileURLs] = useState<string[]>(set.recordingRef || []);
  const [fileCommands, setFileCommands] = useState<string[]>(
    Array(set.recordingRef?.length || 0).fill("keep")
  );
  const [tunes, setTunes] = useState(set.tunes || []);
  const [tuneSearch, setTuneSearch] = useState("");
  const [filteredTunes, setFilteredTunes] = useState(userTunes);
  const [showDropdown, setShowDropdown] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function onCloseModal() {
    setOpenModal(false);
    setSetName(set.setName);
    setLinks(set.links || []);
    setLinkInput("");
    setFiles([]);
    setComments(set.creatorComments || "");
    setFileURLs(set.recordingRef || []);
    setFileCommands(Array(set.recordingRef?.length || 0).fill("keep"));
    setTunes(set.tunes || []);
  }

  // ... Similar file handling methods as UpdateTune ...

  const handleUpdateSet = async () => {
    const formData = new FormData();
    formData.append("setName", setName);
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

    try {
      const response = await fetch(`/api/sets/${itemId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      console.log("Success:", result);
      dataFetch();
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

    // Filter from userTunes instead of a separate tunes array
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

  const removeTune = (tuneId: string) => {
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

  // File handling methods
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
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    if (index < (set.recordingRef?.length || 0)) {
      const newCommands = [...fileCommands];
      newCommands[index] = "delete";
      setFileCommands(newCommands);
      setFileURLs(fileURLs.filter((_, i) => i !== index));
    } else {
      const newIndex = index - (set.recordingRef?.length || 0);
      setFiles(files.filter((_, i) => i !== newIndex));
      setFileURLs(fileURLs.filter((_, i) => i !== index));
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
    return setName.trim() !== "" && tunes.length >= 2;
  };

  const handleRecordingComplete = (file: File, url: string) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    setFileURLs((prevURLs) => [...prevURLs, url]);
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
              Editing Set
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

            <div className="mt-4">
              <Label value="Selected Tunes:" />
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tunes.map((tune) => tune.tuneId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="mt-2">
                    {tunes.map((tune) => (
                      <SortableItem
                        key={tune.tuneId}
                        tune={tune}
                        onRemove={() => removeTune(tune.tuneId)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

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
                <Button onClick={handleUpdateSet}>Update Set</Button>
              ) : (
                <Button disabled onClick={handleUpdateSet}>
                  Update Set
                </Button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UpdateSet;
