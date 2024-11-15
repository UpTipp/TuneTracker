import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { HR, Tabs, TabsRef } from "flowbite-react";
import Cookies from "js-cookie";
import Frame from "../components/Frame";
import NewTune from "../components/NewTune";
import NewSet from "../components/NewSet";
import DisplayTune from "../components/DisplayTune";
import DisplaySet from "../components/DisplaySet";

const User = () => {
  let { id } = useParams();
  const userId = useRef("");

  const [response, setResponse] = useState({
    firstName: "",
    lastName: "",
    tuneStates: [],
    setStates: [],
    sessionStates: [],
  });

  const [tunes, setTunes] = useState([]);
  const [sets, setSets] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [fetchDataTrigger, setFetchDataTrigger] = useState(false);

  const tabsRef = useRef<TabsRef>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const cookie = Cookies.get("user");
    const info = JSON.parse(cookie || "{}");
    userId.current = info.id || "";

    // Trigger data fetch on first render
    setFetchDataTrigger(true);
  }, []);

  useEffect(() => {
    if (fetchDataTrigger && id) {
      fetch(`${window.location.origin}/api/users/` + id, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          data = JSON.parse(data);
          console.log("Data:", data);
          setResponse(data);
          return data;
        })
        .then((data) => {
          // Fetch data for all tunes in tuneStates
          let tunePromises = [];
          if (data.tuneStates && data.tuneStates.length > 0) {
            tunePromises = data.tuneStates.map((tuneState) =>
              fetch(`${window.location.origin}/api/tunes/` + tuneState.tuneId, {
                method: "GET",
                credentials: "include",
              }).then((response) => response.json())
            );
          }

          // Fetch data for all sets in setStates
          let setPromises = [];
          if (data.setStates && data.setStates.length > 0) {
            setPromises = data.setStates.map((setState) =>
              fetch(`${window.location.origin}/api/sets/` + setState.setId, {
                method: "GET",
                credentials: "include",
              }).then((response) => response.json())
            );
          }

          // Fetch data for all sessions in sessionStates
          let sessionPromises = [];
          if (data.sessionStates && data.sessionStates.length > 0) {
            sessionPromises = data.sessionStates.map((sessionState) =>
              fetch(
                `${window.location.origin}/api/sessions/` +
                  sessionState.sessionId,
                { method: "GET", credentials: "include" }
              ).then((response) => response.json())
            );
          }

          return Promise.all([
            Promise.all(tunePromises),
            Promise.all(setPromises),
            Promise.all(sessionPromises),
            data,
          ]);
        })
        .then(([tuneData, setData, sessionData, data]) => {
          console.log("Tune Data:", tuneData);
          console.log("Set Data:", setData);
          console.log("Session Data:", sessionData);

          // Cross-reference data
          if (setData && setData.length > 0) {
            let setStates = data.setStates;
            for (let set of setData) {
              let setState = setStates.find((state) => state.setId === set.id);
              setState.orgUserId = set.userId;
              setState.tuneIds = set.tuneIds;
              setState.links = set.links;
              setState.creatorComments = set.comments;
              setState.tuneNames = [];
              setState.recordingRef = set.recordingRef;

              for (let tuneId of setState.tuneIds) {
                let tune = tuneData.find((tune) => tune.id === tuneId);
                setState.tuneNames.push(tune.tuneName);
              }

              setState.sessionIds = [];
              for (let session of sessionData) {
                if (
                  session.tunes.some((tuneId) =>
                    setState.tuneIds.includes(tuneId)
                  )
                ) {
                  setState.sessionIds.push(session.id);
                }
              }
            }
          }

          if (tuneData && tuneData.length > 0) {
            for (let tune of tuneData) {
              let tuneState = data.tuneStates.find(
                (state) => state.tuneId === tune.tuneId
              );
              tuneState.tuneName = tune.tuneName;
              tuneState.tuneType = tune.tuneType;
              tuneState.orgUserId = tune.userId;
              tuneState.author = tune.author;
              tuneState.link = tune.links;
              tuneState.creatorComments = tune.comments;
              tuneState.recordingRef = tune.recordingRef;

              tuneState.setIds = [];
              tuneState.setNames = [];
              for (let set of setData) {
                if (set.tuneIds.includes(tune.id)) {
                  tuneState.setIds.push(set.id);
                  tuneState.setNames.push(set.setName);
                }
              }

              tuneState.sessionIds = [];
              for (let session of sessionData) {
                if (session.tunes.includes(tune.id)) {
                  tuneState.sessionIds.push(session.id);
                }
              }
            }
          }

          if (sessionData && sessionData.length > 0) {
            for (let session of sessionData) {
              let sessionState = data.sessionStates.find(
                (state) => state.sessionId === session.id
              );
              sessionState.sessionName = session.sessionName;
              sessionState.tuneIds = session.tuneIds;
              sessionState.orgUserId = session.userId;
              sessionState.setIds = session.setIds;
              sessionState.links = session.links;
              sessionState.comments = session.comments;
              sessionState.recordingRef = session.recordingRef;

              sessionState.tuneNames = [];
              for (let tuneId of sessionState.tuneIds) {
                let tune = tuneData.find((tune) => tune.id === tuneId);
                sessionState.tuneNames.push(tune.tuneName);
              }

              sessionState.setNames = [];
              for (let setId of sessionState.setIds) {
                let set = tuneData.find((set) => set.id === setId);
                sessionState.setNames.push(set.setName);
              }
            }
          }

          setTunes(data.tuneStates);
          setSets(data.setStates);
          setSessions(data.sessionStates);

          // Reset fetchDataTrigger to false after fetching data
          setFetchDataTrigger(false);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [fetchDataTrigger, id]);

  // Function to trigger data fetch
  const triggerDataFetch = () => {
    setFetchDataTrigger(true);
  };

  const goTo = (type, id) => {
    if (type === "tune") {
      tabsRef.current?.setActiveTab(0);
      document.getElementById("tu:" + id).scrollIntoView();
    } else if (type === "set") {
      tabsRef.current?.setActiveTab(1);
      document.getElementById("se:" + id).scrollIntoView();
    } else if (type === "session") {
      tabsRef.current?.setActiveTab(2);
      document.getElementById("sn:" + id).scrollIntoView();
    }
    return;
  };

  return (
    <Frame>
      <div className="pt-4 pb-4 pr-1 pl-1 md:pr-10 md:pl-10 lg:pr-20 lg:pl-20">
        <div className="text-center text-green-500 pb-4 md:text-lg text-md">
          {id === userId.current ? (
            <h1>
              Welcome {response.firstName} {response.lastName}!
            </h1>
          ) : (
            <h1>
              {response.firstName} {response.lastName}'s Tunes
            </h1>
          )}
        </div>

        <Tabs
          aria-label="Tabs for Tunes, Sets, and Sessions"
          variant="fullWidth"
          ref={tabsRef}
          onActiveTabChange={(tab) => setActiveTab(tab)}
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
                ></DisplaySet>
              ))}
            </div>
          </Tabs.Item>

          {/* Sessions */}
          <Tabs.Item title="Sessions"></Tabs.Item>
        </Tabs>
      </div>
    </Frame>
  );
};

export default User;
