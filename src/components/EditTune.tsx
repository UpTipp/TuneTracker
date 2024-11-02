import { useState } from "react";
import { Button, FileInput, Checkbox, Label, Modal, TextInput } from "flowbite-react";

const EditTune = ({ children } : {children?: string }) => {
  const [openModal, setOpenModal] = useState(true);
  const [tuneName, setTuneName] = useState('');
  const [tuneType, setTuneType] = useState('');
  const [author, setAuthor] = useState('');
  const [links, setLinks] = useState([]);
  const [comments, setComments] = useState('');


  function onCloseModal() {
    setOpenModal(false);
    setTuneName('');
  }

  function onAddTune() {
    let data = {
      "tuneName" : tuneName,
      "tuneType" : tuneType,
      "author" : author,
      "links" : [],
      "comments" : comments
    }


    setOpenModal(false);
    onCloseModal();
  }

  return (
    <>
    </>
  );
};

export default EditTune;
