import { Button } from "flowbite-react";

const UpdatePractice = ({ type, id, userId, dataFetch }) => {
  const handlePracticeNow = async () => {
    fetch("/api/users/" + userId + "/" + type, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    }).then((response) => {
      if (response.ok) {
        setTimeout(async () => {
          await dataFetch();
        }, 1000);
      }
    });
  };

  return (
    <Button
      className="bg-green-500 hover:enabled:bg-green-700 non-clickable"
      onClick={handlePracticeNow}
    >
      Practice Now
    </Button>
  );
};

export default UpdatePractice;
