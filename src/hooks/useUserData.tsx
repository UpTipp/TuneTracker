import { useState, useEffect } from "react";

const useUserData = (id) => {
  const [userData, setUserData] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`/api/users/${id}`, {
          credentials: "include",
        });
        const userData = await userResponse.json();
        setUserData(JSON.parse(userData));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id, updateTrigger]);

  const triggerDataFetch = async () => {
    setUpdateTrigger((prev) => prev + 1);
  };

  return { userData, triggerDataFetch };
};

export default useUserData;
