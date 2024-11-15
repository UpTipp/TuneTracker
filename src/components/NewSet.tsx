import { useState } from "react";
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

const NewSet = ({ dataFetch, userTunes }) => {
  const [openModal, setOpenModal] = useState(false);

  // Inputs
  const [setName, setSetName] = useState("");
  const [author, setAuthor] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  const [fileURLs, setFileURLs] = useState<string[]>([]);
  const [tuneSearch, setTuneSearch] = useState("");
  const [tunes, setTunes] = useState<{ id: string; name: string }[]>([]);
  const [filteredTunes, setFilteredTunes] = useState<
    { id: string; name: string }[]
  >([]);

  function onCloseModal() {
    setOpenModal(false);
    setSetName("");
    setAuthor("");
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
    const query = event.target.value;
    setTuneSearch(query);
    if (query.trim() !== "") {
      const filtered = userTunes.filter(
        (tune) =>
          tune.name.toLowerCase().includes(query.toLowerCase()) ||
          tune.id.includes(query)
      );
      setFilteredTunes(filtered);
    } else {
      setFilteredTunes([]);
    }
  };

  const addTune = (tune: { id: string; name: string }) => {
    setTunes([...tunes, tune]);
    setTuneSearch("");
    setFilteredTunes([]);
  };

  const removeTune = (index: number) => {
    setTunes(tunes.filter((_, i) => i !== index));
  };

  async function onAddSet() {
    const formData = new FormData();
    formData.append("setName", setName);
    formData.append("author", author);
    formData.append("comments", comments);
    links.forEach((link, index) => {
      formData.append(`links[${index}]`, link);
    });
    files.forEach((file, index) => {
      formData.append(`recordings`, file);
    });
    tunes.forEach((tune, index) => {
      formData.append(`tunes[${index}]`, tune.id);
    });

    console.log(formData);

    try {
      const response = await fetch("/api/sets", {
        method: "POST",
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
      dataFetch(true);
      setOpenModal(false);
      onCloseModal();
    } catch (error) {
      console.error("Error:", error);
    }
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
            <div>
              <div className="mb-2 block">
                <Label htmlFor="links" value="Link(s)" />
              </div>
              <div className="flex">
                <TextInput
                  id="linkInput"
                  value={linkInput}
                  onChange={(event) => setLinkInput(event.target.value)}
                />
                <Button onClick={addLink} className="ml-2">
                  Add Link
                </Button>
              </div>
              <ul className="mt-2">
                {links.map((link, index) => (
                  <li key={index} className="flex items-center">
                    <span>{link}</span>
                    <Button
                      onClick={() => removeLink(index)}
                      className="ml-2"
                      size="xs"
                      color="red"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* File Input */}
            <div id="fileUpload" className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="file" value="Upload file(s)" />
              </div>
              <FileInput
                id="file"
                name="recordings" // Ensure this matches the Multer field name
                onChange={addFile}
                helperText="Mp3, Mp4, etc. MAX (10 MB)"
                multiple
              />
              <ul className="mt-2">
                {fileURLs.map((url, index) => (
                  <li key={index} className="flex items-center">
                    <ReactPlayer
                      url={url}
                      controls
                      width="80%"
                      height="30px"
                      className="ml-2"
                    />
                    <Button
                      onClick={() => removeFile(index)}
                      className="ml-2"
                      size="xs"
                      color="red"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tune Search */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="tuneSearch" value="Add Tune(s)" />
              </div>
              <div className="flex">
                <TextInput
                  id="tuneSearch"
                  value={tuneSearch}
                  onChange={handleTuneSearch}
                />
              </div>
              <ul className="mt-2">
                {filteredTunes.map((tune) => (
                  <li key={tune.id} className="flex items-center">
                    <span>{tune.name}</span>
                    <Button
                      onClick={() => addTune(tune)}
                      className="ml-2"
                      size="xs"
                      color="blue"
                    >
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
              <ul className="mt-2">
                {tunes.map((tune, index) => (
                  <li key={index} className="flex items-center">
                    <span>{tune.name}</span>
                    <Button
                      onClick={() => removeTune(index)}
                      className="ml-2"
                      size="xs"
                      color="red"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
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
            <div className="w-full justify-center">
              <Button onClick={onAddSet}>Add Set</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewSet;
