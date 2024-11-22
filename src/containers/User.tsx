import { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button, HR, Tabs, TabsRef } from "flowbite-react";
import Cookies from "js-cookie";
import Frame from "../components/Frame";
import NewTune from "../components/NewTune";
import NewSet from "../components/NewSet";
import NewSession from "../components/NewSession";
import DisplayTune from "../components/DisplayTune";
import DisplaySet from "../components/DisplaySet";
import DisplaySession from "../components/DisplaySession";
import { useUserData } from "../hooks/useUserData";

const User = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = useRef("");
  const tabsRef = useRef<TabsRef>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [itemMemory, setItemMemory] = useState([[]]);

  // Use the custom hook
  const { userData, tunes, sets, sessions, triggerDataFetch } = useUserData(id);

  useEffect(() => {
    const fetchData = async () => {
      const cookie = Cookies.get("user");
      const info = JSON.parse(cookie || "{}");
      userId.current = info.id || "";
      await triggerDataFetch("user");

      // Handle navigation based on URL parameters
      const type = searchParams.get("type");
      const itemId = searchParams.get("itemId");

      if (type) {
        if (itemId) {
          // Wait a brief moment to ensure data is loaded
          setTimeout(() => goTo(type, itemId), 100);
        } else {
          // Just switch to the appropriate tab
          switch (type) {
            case "tune":
              tabsRef.current?.setActiveTab(0);
              break;
            case "set":
              tabsRef.current?.setActiveTab(1);
              break;
            case "session":
              tabsRef.current?.setActiveTab(2);
              break;
          }
        }
      }
    };
    fetchData();
  }, [searchParams]); // Add searchParams as dependency

  const updateItemMemory = (type: string, id: string) => {
    setItemMemory((prevMemory) => {
      const newMemory = [...prevMemory, [type, id]];
      console.log("Updated Item Memory:", newMemory);
      return newMemory;
    });
  };

  const goBack = () => {
    setItemMemory((prevMemory) => {
      const newMemory = [...prevMemory];
      const item = newMemory.pop();
      console.log("Going back to:", item);
      if (item) {
        goTo(item[0], item[1]);
      }
      return newMemory;
    });
  };

  const highlightElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("border-green-500");
      setTimeout(() => {
        element.classList.remove("border-green-500");
      }, 3000);
    }
  };

  const updateUrl = (type: string, itemId?: string) => {
    const baseUrl = `/user/${id}?type=${type}`;
    navigate(itemId ? `${baseUrl}&itemId=${itemId}` : baseUrl, {
      replace: true,
    });
  };

  const goTo = (type: string, id: string) => {
    if (type === "tune") {
      tabsRef.current?.setActiveTab(0);
      const elementId = "tu:" + id;
      document.getElementById(elementId)?.scrollIntoView();
      highlightElement(elementId);
      updateUrl(type, id);
    } else if (type === "set") {
      tabsRef.current?.setActiveTab(1);
      const elementId = "se:" + id;
      document.getElementById(elementId)?.scrollIntoView();
      highlightElement(elementId);
      updateUrl(type, id);
    } else if (type === "session") {
      tabsRef.current?.setActiveTab(2);
      const elementId = "sn:" + id;
      document.getElementById(elementId)?.scrollIntoView();
      highlightElement(elementId);
      updateUrl(type, id);
    }
  };

  return (
    <Frame>
      <div className="pt-4 pb-4 pr-1 pl-1 md:pr-10 md:pl-10 lg:pr-20 lg:pl-20">
        <div className="text-center text-green-500 pb-4 md:text-lg text-md">
          {id === userId.current ? (
            <h1>
              Welcome {userData.firstName} {userData.lastName}!
            </h1>
          ) : (
            <h1>
              {userData.firstName} {userData.lastName}'s Tunes
            </h1>
          )}
        </div>

        <Tabs
          aria-label="Tabs for Tunes, Sets, and Sessions"
          variant="fullWidth"
          ref={tabsRef}
          onActiveTabChange={(tab) => {
            setActiveTab(tab);
            const types = ["tune", "set", "session"];
            updateUrl(types[tab]);
          }}
        >
          {/* Tunes */}
          <Tabs.Item active title="Tunes">
            <div className="flex flex-row justify-center">
              <NewTune dataFetch={triggerDataFetch} />
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {tunes.map((tune) => (
                <DisplayTune
                  tune={tune}
                  userId={id}
                  dataFetch={triggerDataFetch}
                  goTo={goTo}
                  itemMemory={updateItemMemory}
                ></DisplayTune>
              ))}
            </div>
          </Tabs.Item>

          {/* Sets */}
          <Tabs.Item title="Sets">
            <div className="flex flex-row justify-center">
              <NewSet dataFetch={triggerDataFetch} userTunes={tunes} />
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {sets.map((set) => (
                <DisplaySet
                  set={set}
                  userId={id}
                  dataFetch={triggerDataFetch}
                  goTo={goTo}
                  itemMemory={updateItemMemory}
                ></DisplaySet>
              ))}
            </div>
          </Tabs.Item>

          {/* Sessions */}
          <Tabs.Item title="Sessions">
            <div className="flex flex-row justify-center">
              <NewSession
                dataFetch={triggerDataFetch}
                userTunes={tunes}
                userSets={sets}
              />
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {sessions.map((session) => (
                <DisplaySession
                  session={session}
                  userId={id}
                  dataFetch={triggerDataFetch}
                  goTo={goTo}
                  itemMemory={updateItemMemory}
                ></DisplaySession>
              ))}
            </div>
          </Tabs.Item>
        </Tabs>
        {itemMemory.length > 1 && (
          <Button
            onClick={goBack}
            className="fixed bottom-10 left-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50"
          >
            Back
          </Button>
        )}
      </div>
    </Frame>
  );
};

export default User;
