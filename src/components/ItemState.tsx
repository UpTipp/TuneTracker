import React, { useState } from "react";
import { Dropdown } from "flowbite-react";
import Cookie from "js-cookie";

const ItemState = ({ state, item, id, userId }) => {
  const [currentState, setCurrentState] = useState(state);
  const [label, setLabel] = useState(getLabel(state));
  const [className, setClassName] = useState(getClassName(state));
  const checkId = JSON.parse(Cookie.get("user") || "{}").id;

  function getLabel(state) {
    switch (state) {
      case "want-to-learn":
        return "To Learn";
      case "know":
        return "Learnt";
      case "learning":
        return "Learning";
      case "relearn":
        return "Relearn";
      default:
        return "Unknown";
    }
  }

  function getClassName(state) {
    let baseClass = "text-white text-sm p-2 rounded-lg w-fit ";
    switch (state) {
      case "want-to-learn":
        return baseClass + "bg-red-300";
      case "know":
        return baseClass + "bg-green-300";
      case "learning":
        return baseClass + "bg-yellow-200";
      case "relearn":
        return baseClass + "bg-purple-300";
      default:
        return baseClass + "bg-gray-400";
    }
  }

  const handleChange = async (newState) => {
    if (checkId && checkId !== userId) {
      alert("You are not authorized to change this state");
    } else {
      let body = JSON.stringify({ state: newState, item: item, id: id });
      console.log("Body, " + body);
      try {
        const response = await fetch("/api/users/" + userId + "/state", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: newState, item: item, id: id }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        setCurrentState(newState);
        setLabel(getLabel(newState));
        setClassName(getClassName(newState));
      } catch (error) {
        console.error("Failed to update state", error);
      }
    }
  };

  if (checkId == null || checkId !== userId) {
    return (
      <div className={className}>
        <span>{label}</span>
      </div>
    );
  } else {
    return (
      <div className={className}>
        <Dropdown label={label} inline>
          <Dropdown.Item
            onClick={() => handleChange("know")}
            className="text-green-300"
          >
            Know
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => handleChange("learning")}
            className="text-yellow-200"
          >
            Learning
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => handleChange("want-to-learn")}
            className="text-red-200"
          >
            Want to Learn
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => handleChange("relearn")}
            className="text-purple-300"
          >
            Relearn
          </Dropdown.Item>
        </Dropdown>
      </div>
    );
  }
};

export default ItemState;