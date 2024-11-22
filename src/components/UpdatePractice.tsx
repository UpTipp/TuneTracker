import { Button } from "flowbite-react";

const UpdatePractice = ({ type, id, userId, dataFetch }) => {
  const handlePracticeNow = () => {
    fetch("/api/users/" + userId + "/" + type, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    }).then((response) => {
      if (response.ok) {
        dataFetch();
      }
    });
  };

  return (
    <Button
      className="bg-green-500 hover:enabled:bg-green-700"
      onClick={handlePracticeNow}
    >
      Practice Now
    </Button>
  );
};

export default UpdatePractice;
