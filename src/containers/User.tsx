import Frame from '../components/Frame';
import AddTune from '../components/AddTune';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useState, useEffect, useRef } from 'react';
import { Card } from "flowbite-react";

const User = () => {
  let { id } = useParams();
  const userId = useRef("");

  const [response, setResponse] = useState({ firstName: '', lastName: '',  
    tuneStates : [], setStates : [], sessionStates : [] });
  
  const [tunes, setTunes] = useState([]);
  const [sets, setSets] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [fetchDataTrigger, setFetchDataTrigger] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get('user');
    const info = JSON.parse(cookie || '{}');
    userId.current = info.id || "";

     // Trigger data fetch on first render
     setFetchDataTrigger(true);
  }, []);

  useEffect(() => {
    if (fetchDataTrigger && id) {
      fetch(`${window.location.origin}/api/users/` + id, { method: 'GET', credentials: 'include' })
        .then(response => response.json()) 
        .then (data => {
          data = JSON.parse(data);
          console.log('Data:', data);
          setResponse(data);
          return data;
        })
        .then(data => {
          // Fetch data for all tunes in tuneStates
          let tunePromises = [];
          if (data.tuneStates && data.tuneStates.length > 0) {
            tunePromises = data.tuneStates.map(tuneState => 
              fetch(`${window.location.origin}/api/tunes/` + tuneState.tuneId, { method: 'GET', credentials: 'include' })
                .then(response => response.json())
            );
          }

          // Fetch data for all sets in setStates
          let setPromises = [];
          if (data.setStates && data.setStates.length > 0) {
            setPromises = data.setStates.map(setState => 
              fetch(`${window.location.origin}/api/sets/` + setState.setId, { method: 'GET', credentials: 'include' })
                .then(response => response.json())
            );
          }

          // Fetch data for all sessions in sessionStates
          let sessionPromises = [];
          if (data.sessionStates && data.sessionStates.length > 0) {
            sessionPromises = data.sessionStates.map(sessionState => 
              fetch(`${window.location.origin}/api/sessions/` + sessionState.sessionId, { method: 'GET', credentials: 'include' })
                .then(response => response.json())
            );
          }

          return Promise.all([Promise.all(tunePromises), Promise.all(setPromises), Promise.all(sessionPromises), data]);
        })
        .then(([tuneData, setData, sessionData, data]) => {
          console.log('Tune Data:', tuneData);
          console.log('Set Data:', setData);
          console.log('Session Data:', sessionData);

          // Cross-reference data
          if (setData && setData.length > 0) {
            let setStates = data.setStates;
            for (let set of setData) {
              let setState = setStates.find(state => state.setId === set.id);
              setState.tuneIds = set.tuneIds;
              setState.links = set.links;
              setState.creatorComments = set.comments;
              setState.tuneNames = [];
              for (let tuneId of setState.tuneIds) {
                let tune = tuneData.find(tune => tune.id === tuneId);
                setState.tuneNames.push(tune.name);
              }

              setState.sessionIds = [];
              for (let session of sessionData) {
                if (session.tunes.some(tuneId => setState.tuneIds.includes(tuneId))) {
                  setState.sessionIds.push(session.id);
                }
              }
            }
          }

          if (tuneData && tuneData.length > 0) {
            for (let tune of tuneData) {
              let tuneState = data.tuneStates.find(state => state.tuneId === tune.tuneId);
              tuneState.tuneName = tune.name;
              tuneState.tuneType = tune.type;
              tuneState.author = tune.author;
              tuneState.link = tune.link;
              tuneState.creatorComments = tune.comments;

              tuneState.setIds = [];
              tuneState.setNames = [];
              for (let set of setData) {
                if (set.tuneIds.includes(tune.id)) {
                  tuneState.setIds.push(set.id);
                  tuneState.setNames.push(set.name);
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
              let sessionState = data.sessionStates.find(state => state.sessionId === session.id);
              sessionState.sessionName = session.name;
              sessionState.tuneIds = session.tuneIds;
              sessionState.setIds = session.setIds;
              sessionState.links = session.links;
              sessionState.comments = session.comments;

              sessionState.tuneNames = [];
              for (let tuneId of sessionState.tuneIds) {
                let tune = tuneData.find(tune => tune.id === tuneId);
                sessionState.tuneNames.push(tune.name);
              }

              sessionState.setNames = [];
              for (let setId of sessionState.setIds) {
                let set = tuneData.find(set => set.id === setId);
                sessionState.setNames.push(set.name);
              }
            }
          }

          setTunes(data.tuneStates);
          setSets(data.setStates);
          setSessions(data.sessionStates);

          // Reset fetchDataTrigger to false after fetching data
          setFetchDataTrigger(false);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          // window.location.href = '/';
        });
    }
  }, [fetchDataTrigger, id]);

  // Function to trigger data fetch
  const triggerDataFetch = () => {
    setFetchDataTrigger(true);
  };

  return (
    <Frame>
      <div className='pt-4 pb-4 md:pr-10 md:pl-10 lg:pr-20 lg:pl-20'>
        <div className='text-center text-green-600 pb-4 md:text-lg text-md'>
          {id === userId.current ? 
            (<h1>Welcome {response.firstName} {response.lastName}!</h1>) 
            : (<h1>{response.firstName} {response.lastName}'s Tunes</h1>)}
        </div>
        <AddTune dataFetch={triggerDataFetch}/>
        {/* <Tunes tuneStates={response.tuneStates}/> */}
      </div>
    </Frame>
  );
};

export default User;