import { useState } from "react";
import { Button, Textarea, Select, FileInput, Label, Modal, TextInput } from "flowbite-react";

const AddTune = ({ dataFetch }) => {
  const [openModal, setOpenModal] = useState(false);

  // Inputs
  const [tuneName, setTuneName] = useState('');
  const [tuneType, setTuneType] = useState('Reel');
  const [author, setAuthor] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState('');


  function onCloseModal() {
    setOpenModal(false);
    setTuneName('');
    setAuthor('');
    setLinks([]);
    setLinkInput('');
    setFiles([]);
    setComments('');
  }

  const addLink = () => {
    if (linkInput.trim() !== '') {
      setLinks([...links, linkInput.trim()]);
      setLinkInput('');
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const addFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles([...files, ...Array.from(event.target.files)]);
      event.target.value = ''; // Clear the input value to allow re-uploading the same file
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  async function onAddTune() {
    const formData = new FormData();
    formData.append('tuneName', tuneName);
    formData.append('tuneType', tuneType);
    formData.append('author', author);
    formData.append('comments', comments);
    links.forEach((link, index) => {
      formData.append(`links[${index}]`, link);
    });
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    try {
      const response = await fetch('/api/tunes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
      dataFetch(true);
    } catch (error) {
      console.error('Error:', error);
    }

    setOpenModal(false);
    onCloseModal();
  }

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>Add Tune</Button>
      <Modal show={openModal} size="xl" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Add a Tune!</h3>

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
                <Button onClick={addLink} className="ml-2">Add Link</Button>
              </div>
              <ul className="mt-2">
                {links.map((link, index) => (
                  <li key={index} className="flex items-center">
                    <span>{link}</span>
                    <Button onClick={() => removeLink(index)} className="ml-2" size="xs" color="red">Remove</Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* File Input */}
            <div id="fileUpload" className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="file" value="Upload file(s)" />
              </div>
              <FileInput id="file" onChange={addFile} helperText="Mp3, Mp4, etc. MAX (10 MB)" />
              <ul className="mt-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center">
                    <span>{file.name}</span>
                    <Button onClick={() => removeFile(index)} className="ml-2" size="xs" color="red">Remove</Button>
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
              <Button onClick={onAddTune}>Add Tune</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddTune;
