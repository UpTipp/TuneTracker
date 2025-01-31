import { useState, useEffect } from "react";

export const useUserData = (id: string) => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    tuneStates: [],
    setStates: [],
    sessionStates: [],
  });
  const [tunes, setTunes] = useState([]);
  const [sets, setSets] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [fetchTriggers, setFetchTriggers] = useState({
    user: false,
    tunes: false,
    sets: false,
    sessions: false,
  });

  // Utility function to merge state data with fetched data
  const mergeWithState = (item: any, stateArray: any[], idKey: string) => {
    const stateData =
      stateArray.find((state) => state[idKey] === item[idKey]) || {};
    return {
      ...item,
      lastPractice: stateData.lastPractice || null,
      comments: stateData.comments || "",
      state: stateData.state || "unknown",
    };
  };

  // Fetch user data
  useEffect(() => {
    if (fetchTriggers.user && id) {
      console.log("⭐ Fetching user data...");
      fetch(`${window.location.origin}/api/users/${id}`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          data = JSON.parse(data);
          console.log("📥 Raw user data:", data);
          setUserData(data);
          // Trigger tune fetching if there are tunes
          if (data.tuneStates?.length > 0) {
            setFetchTriggers((prev) => ({ ...prev, tunes: true }));
          }
        })
        .catch((error) => console.error("Error fetching user data:", error))
        .finally(() => setFetchTriggers((prev) => ({ ...prev, user: false })));
    }
  }, [fetchTriggers.user, id]);

  // Fetch tunes
  useEffect(() => {
    if (fetchTriggers.tunes && userData.tuneStates?.length > 0) {
      console.log("⭐ Fetching tunes...");

      Promise.all(
        userData.tuneStates.map((state) =>
          fetch(`${window.location.origin}/api/tunes/${state.tuneId}`, {
            method: "GET",
            credentials: "include",
          })
            .then((res) => res.json())
            .then((data) =>
              typeof data === "string" ? JSON.parse(data) : data
            )
        )
      )
        .then((tuneData) => {
          const processedTunes = tuneData.map((tune) => {
            const processed = {
              tuneId: tune.tuneId,
              tuneName: tune.tuneName || "Unknown Tune",
              tuneKey: tune.tuneKey,
              tuneType: tune.tuneType,
              orgUserId: tune.userId,
              author: tune.author,
              links: tune.links,
              creatorComments: tune.comments,
              recordingRef: tune.recordingRef,
              dateAdded: tune.dateAdded,
              // These will be populated by sets and sessions
              setIds: [],
              setNames: [],
              sessionIds: [],
            };
            return mergeWithState(processed, userData.tuneStates, "tuneId");
          });

          setTunes(processedTunes);
          if (userData.setStates?.length > 0) {
            setFetchTriggers((prev) => ({ ...prev, sets: true }));
          }
        })
        .catch((error) => {
          console.error("Error in tune processing:", error);
          console.error("Stack:", error.stack);
        })
        .finally(() => setFetchTriggers((prev) => ({ ...prev, tunes: false })));
    }
  }, [fetchTriggers.tunes, userData.tuneStates]);

  // Fetch sets
  useEffect(() => {
    if (fetchTriggers.sets && userData.setStates?.length > 0) {
      console.log("⭐ Fetching sets...");
      console.log("📌 Current set states:", userData.setStates);
      console.log("📌 Current tunes for reference:", tunes);

      Promise.all(
        userData.setStates.map((state) =>
          fetch(`${window.location.origin}/api/sets/${state.setId}`, {
            method: "GET",
            credentials: "include",
          }).then((res) => res.json())
        )
      )
        .then((setData) => {
          console.log("📥 Raw set data:", setData);
          // First, process the sets with tune information
          const processedSets = setData.map((set) => {
            const tuneIds = set.tuneIds || [];
            // Use raw tune data for names instead of processed tunes
            const tuneNames = tuneIds.map((id) => {
              const tune = tunes.find((t) => t.tuneId === id);
              return tune ? tune.tuneName || "Unknown Tune" : "Unknown Tune";
            });

            const processed = {
              setId: set.setId,
              setName: set.setName,
              orgUserId: set.userId,
              links: set.links,
              creatorComments: set.comments,
              recordingRef: set.recordingRef,
              tuneIds,
              tuneNames,
              sessionIds: [],
              dateAdded: set.dateAdded,
            };
            return mergeWithState(processed, userData.setStates, "setId");
          });

          console.log("✨ Processed sets:", processedSets);

          console.log("🔄 Starting tune cross-referencing...");
          // Then update tunes with set information
          const updatedTunes = tunes.map((tune) => {
            const relevantSets = processedSets.filter((set) =>
              set.tuneIds.includes(tune.tuneId)
            );
            return {
              ...tune,
              setIds: relevantSets.map((set) => set.setId),
              setNames: relevantSets.map((set) => set.setName),
            };
          });
          console.log("✨ Updated tunes with set references:", updatedTunes);

          // Gather unique tuneTypes for each set
          processedSets.forEach((set) => {
            const typeSet = new Set<string>();
            set.tuneIds.forEach((tuneId) => {
              const tune = tunes.find((t) => t.tuneId === tuneId);
              if (tune) {
                typeSet.add(tune.tuneType);
              }
            });
            set.tuneTypes = Array.from(typeSet);
          });

          setSets(processedSets);
          setTunes(updatedTunes);

          if (userData.sessionStates?.length > 0) {
            setFetchTriggers((prev) => ({ ...prev, sessions: true }));
          }
        })
        .catch((error) => console.error("Error fetching sets:", error))
        .finally(() => setFetchTriggers((prev) => ({ ...prev, sets: false })));
    }
  }, [fetchTriggers.sets, userData.setStates, tunes]);

  // Fetch sessions
  useEffect(() => {
    if (fetchTriggers.sessions && userData.sessionStates?.length > 0) {
      console.log("⭐ Fetching sessions...");
      console.log("📌 Current session states:", userData.sessionStates);
      console.log("📌 Current tunes for reference:", tunes);
      console.log("📌 Current sets for reference:", sets);

      Promise.all(
        userData.sessionStates.map((state) =>
          fetch(`${window.location.origin}/api/sessions/${state.sessionId}`, {
            method: "GET",
            credentials: "include",
          }).then((res) => res.json())
        )
      )
        .then((sessionData) => {
          console.log("📥 Raw session data:", sessionData);
          // First, process the sessions with tune and set information
          const processedSessions = sessionData.map((session) => {
            const tuneIds = session.tuneIds || [];
            const setIds = session.setIds || [];

            const tuneNames = tuneIds
              .map((id) => tunes.find((t) => t.tuneId === id)?.tuneName)
              .filter(Boolean);

            const setNames = setIds
              .map((id) => sets.find((s) => s.setId === id)?.setName)
              .filter(Boolean);

            const processed = {
              sessionId: session.sessionId,
              sessionName: session.sessionName,
              orgUserId: session.userId,
              links: session.links,
              creatorComments: session.comments,
              recordingRef: session.recordingRef,
              tuneIds,
              tuneNames,
              setIds,
              setNames,
              dateAdded: session.dateAdded,
            };
            return mergeWithState(
              processed,
              userData.sessionStates,
              "sessionId"
            );
          });
          console.log("✨ Processed sessions:", processedSessions);

          console.log("🔄 Starting final tune cross-referencing...");
          // Update tunes with session information
          const updatedTunes = tunes.map((tune) => {
            const relevantSessions = processedSessions.filter((session) =>
              session.tuneIds.includes(tune.tuneId)
            );
            return {
              ...tune,
              sessionIds: relevantSessions.map((session) => session.sessionId),
            };
          });
          console.log("✨ Final updated tunes:", updatedTunes);

          // Update sets with session information
          const updatedSets = sets.map((set) => {
            const relevantSessions = processedSessions.filter((session) =>
              session.setIds.includes(set.setId)
            );
            return {
              ...set,
              sessionIds: relevantSessions.map((session) => session.sessionId),
            };
          });

          setSessions(processedSessions);
          setTunes(updatedTunes);
          setSets(updatedSets);
        })
        .catch((error) => console.error("Error fetching sessions:", error))
        .finally(() =>
          setFetchTriggers((prev) => ({ ...prev, sessions: false }))
        );
    }
  }, [fetchTriggers.sessions, userData.sessionStates, tunes, sets]);

  const triggerDataFetch = (type = "all") => {
    setFetchTriggers((prev) => ({
      ...prev,
      user: type === "all" || type === "user",
      tunes: type === "all" || type === "tunes",
      sets: type === "all" || type === "sets",
      sessions: type === "all" || type === "sessions",
    }));
  };

  return {
    userData,
    tunes,
    sets,
    sessions,
    triggerDataFetch,
  };
};
