import { useState } from "react";
import { Card, Button } from "flowbite-react";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import ItemHeader from "./ItemHeader";
import ReactPlayer from "react-player";
import Cookie from "js-cookie";
import UpdatePractice from "./UpdatePractice";
import UpdateSession from "./UpdateSession";
import AddItem from "./AddItem";
import CopyItem from "./CopyItem";

const customCard = {
  root: {
    children: "flex h-full flex-col justify-normal gap-4 p-6",
  },
};

const DisplaySession = ({ session, userId, dataFetch, goTo, itemMemory }) => {
  const checkId = JSON.parse(Cookie.get("user") || "{}").id;
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = (event) => {
    if (
      event.target.closest(".non-clickable") ||
      event.target.tagName === "BUTTON" ||
      event.target.tagName === "SPAN" ||
      event.target.tagName === "A" ||
      (event.target.tagName === "DIV" &&
        event.target.className.includes("itemState")) ||
      (event.target.tagName === "svg" &&
        !event.target.classList.contains("arrow")) ||
      (event.target.tagName === "path" &&
        !event.target.closest("svg").classList.contains("arrow"))
    ) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const linkClink = (type: string, id: string) => {
    goTo(type, id);
    itemMemory("session", session.sessionId);
  };

  let dateAdded = session.dateAdded ? new Date(session.dateAdded) : null;
  let lastPractice = session.lastPractice
    ? new Date(session.lastPractice)
    : new Date();
  const dateDiffer = Math.floor(
    (Date.now() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
  );

  let dateAddedStr = dateAdded ? dateAdded.toDateString() : null;
  let lastPracticeStr = lastPractice ? lastPractice.toDateString() : null;

  const hasBackContent =
    (session.link && session.link.length > 0) ||
    (session.creatorComments && session.creatorComments !== "") ||
    (session.recordingRef && session.recordingRef.length > 0);

  return (
    <Card
      onClick={hasBackContent ? handleCardClick : undefined}
      theme={customCard}
      id={"sn:" + session.sessionId}
      className="w-full max-w-lg border-2 hover:border-blue-400 flex flex-col justify-between"
    >
      {isFlipped ? (
        // Back of card
        <>
          <ItemHeader
            itemName={session.sessionName}
            item={"session"}
            itemType={"Session"}
            itemState={session.state}
            itemId={session.sessionId}
            userId={userId}
            dataFetch={dataFetch}
          />
          <div>
            {/* Links section */}
            {session.link && session.link.length > 0 && (
              <>
                <div className="pt-1 pb-1">
                  <h6 className="text-md mb-1">Links:</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md flex justify-normal flex-wrap non-clickable">
                    {Array.isArray(session.link) &&
                      session.link.length > 0 &&
                      session.link.map((link, index) => (
                        <>
                          <a
                            key={index}
                            href={link}
                            className="text-blue-600 text-sm w-min underline decoration-inherit"
                          >
                            {link}
                          </a>
                          {index < session.link.length - 1 && <p>, </p>}
                        </>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Comments section */}
            {session.creatorComments &&
              session.creatorComments !== "" &&
              session.orgUserId !== userId && (
                <>
                  <div className="pt-1 pb-1">
                    <h6 className="text-md">Tracker's Comment:</h6>
                    <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                      <p className="text-sm italic">
                        {session.creatorComments}
                      </p>
                    </div>
                  </div>
                </>
              )}

            {/* Recordings section */}
            {session.recordingRef && session.recordingRef.length > 0 && (
              <>
                <div className="pt-1 pb-1">
                  <h6 className="text-md">Recording(s):</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                    {session.recordingRef.map((recording, index) => (
                      <ReactPlayer
                        key={index}
                        url={recording}
                        controls
                        playsinline
                        style={{ width: "80%", height: "30px" }}
                        width="100%"
                        height="100%"
                        config={{
                          file: {
                            attributes: {
                              controlsList: "nodownload",
                              playsInline: true,
                            },
                            forceAudio: true,
                          },
                        }}
                        fallback={
                          <audio controls src={recording} className="w-full">
                            Your browser does not support the audio element.
                          </audio>
                        }
                        className="ml-2"
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex-grow"></div>
          {/* Back arrow */}
          {hasBackContent ? (
            <div className="w-full flex justify-center items-center pt-1 h-11">
              <IoIosArrowDropleftCircle className="arrow opacity-60" />
            </div>
          ) : (
            <div className="w-full flex justify-center items-center pt-1 h-11">
              <IoIosArrowDropleftCircle className="arrow opacity-0" />
            </div>
          )}
        </>
      ) : (
        // Front of card
        <>
          <ItemHeader
            itemName={session.sessionName}
            item={"session"}
            itemType={"Session"}
            itemState={session.state}
            itemId={session.sessionId}
            userId={userId}
            dataFetch={dataFetch}
          />
          <div>
            {session.lastPractice && (
              <p className="text-sm italic pb-1">
                Last Practiced: {lastPracticeStr} ({dateDiffer} days ago)
              </p>
            )}

            {/* Creator Comments section */}
            {session.creatorComments &&
              session.creatorComments !== "" &&
              session.orgUserId === userId && (
                <>
                  <div className="pt-1 pb-1">
                    <h6 className="text-md">User's Comment:</h6>
                    <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md">
                      <p className="text-sm italic">
                        {session.creatorComments}
                      </p>
                    </div>
                  </div>
                </>
              )}

            {session.comments &&
              session.comments !== "" &&
              session.orgUserId !== userId && (
                <div className="pt-1 pb-1">
                  <h6 className="text-md">User's Comment:</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md">
                    <p className="text-sm italic">{session.comments}</p>
                  </div>
                </div>
              )}

            {/* Referenced Items section */}
            <div className="pt-1 pb-1">
              <h6 className="text-md">Referenced Items:</h6>

              {/* Tunes section */}
              <div className="flex justify-normal flex-wrap non-clickable">
                <p className="text-sm text-green-500 mr-1">Tunes:</p>
                {session.tuneIds && session.tuneIds.length > 0 ? (
                  session.tuneIds.map((tuneId, index) => (
                    <>
                      <a
                        key={tuneId}
                        className="text-sm text-blue-400 hover:text-emerald-500"
                        onClick={() => linkClink("tune", tuneId)}
                      >
                        [
                        {session.tuneNames[index].length <= 20
                          ? session.tuneNames[index]
                          : session.tuneNames[index].substring(0, 20) + "..."}
                        ]
                      </a>
                      {index < session.tuneIds.length - 1 && (
                        <p className="mr-1">, </p>
                      )}
                    </>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No tunes added</p>
                )}
              </div>

              {/* Sets section */}
              <div className="flex justify-normal flex-wrap non-clickable">
                <p className="text-sm text-green-500 mr-1">Sets:</p>
                {session.setIds && session.setIds.length > 0 ? (
                  session.setIds.map((setId, index) => (
                    <>
                      <a
                        key={setId}
                        className="text-sm text-blue-400 hover:text-emerald-500"
                        onClick={() => linkClink("set", setId)}
                      >
                        [
                        {session.setNames[index].length <= 20
                          ? session.setNames[index]
                          : session.setNames[index].substring(0, 20) + "..."}
                        ]
                      </a>
                      {index < session.setIds.length - 1 && (
                        <p className="mr-1">, </p>
                      )}
                    </>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No sets added</p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-grow"></div>
          <div className="flex justify-between pt-1">
            {userId === checkId ? (
              <>
                {userId === session.orgUserId ? (
                  <>
                    <UpdatePractice
                      type={"session"}
                      id={session.sessionId}
                      userId={userId}
                      dataFetch={dataFetch}
                    />
                    {hasBackContent ? (
                      <div className="flex justify-center items-center">
                        <IoIosArrowDroprightCircle className="arrow opacity-60" />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center">
                        <IoIosArrowDroprightCircle className="arrow opacity-0" />
                      </div>
                    )}
                    <div className="non-clickable">
                      <UpdateSession
                        type={"session"}
                        itemId={session.sessionId}
                        session={{
                          ...session,
                          tunes:
                            session.tuneIds?.map((id, index) => ({
                              tuneId: id,
                              tuneName: session.tuneNames[index],
                            })) || [],
                          sets:
                            session.setIds?.map((id, index) => ({
                              setId: id,
                              setName: session.setNames[index],
                            })) || [],
                        }}
                        dataFetch={dataFetch}
                        userTunes={session.userTunes || []}
                        userSets={session.userSets || []}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <CopyItem />
                    {hasBackContent ? (
                      <div className="flex justify-center items-center">
                        <IoIosArrowDroprightCircle className="arrow opacity-60" />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center">
                        <IoIosArrowDroprightCircle className="arrow opacity-0" />
                      </div>
                    )}
                    <UpdatePractice
                      type={"session"}
                      id={session.sessionId}
                      userId={userId}
                      dataFetch={dataFetch}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {userId && checkId ? (
                  <>
                    <CopyItem />
                    {hasBackContent ? (
                      <div className="flex justify-center items-center">
                        <IoIosArrowDroprightCircle className="arrow opacity-60" />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center">
                        <IoIosArrowDroprightCircle className="arrow opacity-0" />
                      </div>
                    )}
                    <AddItem />
                  </>
                ) : (
                  <>
                    <Button
                      className="bg-green-500 hover:enabled:bg-green-700"
                      disabled
                    >
                      Copy
                    </Button>
                    {hasBackContent ? (
                      <div className="flex justify-center items-center">
                        <IoIosArrowDroprightCircle className="arrow opacity-60" />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center">
                        <IoIosArrowDroprightCircle className="arrow opacity-0" />
                      </div>
                    )}
                    <Button className="bg-blue-400" disabled>
                      Add Session
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default DisplaySession;
