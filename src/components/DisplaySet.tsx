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
import UpdateSet from "./UpdateSet";
import AddItem from "./AddItem";
import CopyItem from "./CopyItem";

const customCard = {
  root: {
    children: "flex h-full flex-col justify-normal gap-4 p-6",
  },
};

const DisplaySet = ({ set, userId, dataFetch, goTo, itemMemory }) => {
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
    itemMemory("set", set.setId);
  };

  let dateAdded = set.dateAdded ? new Date(set.dateAdded) : null;
  let lastPractice = set.lastPractice ? new Date(set.lastPractice) : new Date();
  const dateDiffer = Math.floor(
    (Date.now() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
  );

  let dateAddedStr = dateAdded ? dateAdded.toDateString() : null;
  let lastPracticeStr = lastPractice ? lastPractice.toDateString() : null;

  const hasBackContent =
    (set.link && set.link.length > 0) ||
    (set.creatorComments && set.creatorComments !== "") ||
    (set.recordingRef && set.recordingRef.length > 0);

  return (
    <Card
      onClick={hasBackContent ? handleCardClick : undefined}
      theme={customCard}
      id={"se:" + set.setId}
      className="w-full max-w-lg border-2 hover:border-blue-400 flex flex-col justify-between"
    >
      {isFlipped ? (
        // Back of card
        <>
          <ItemHeader
            itemName={set.setName}
            item={"set"}
            itemType={"Set"}
            itemState={set.state}
            itemId={set.setId}
            userId={userId}
            dataFetch={dataFetch}
          />
          <div>
            {set.link && set.link.length > 0 && (
              <>
                <div className="pt-1 pb-1">
                  <h6 className="text-md mb-1">Links:</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md flex justify-normal flex-wrap non-clickable">
                    {Array.isArray(set.link) &&
                      set.link.length > 0 &&
                      set.link.map((link, index) => (
                        <>
                          <a
                            key={index}
                            href={link}
                            className="text-blue-600 text-sm w-min underline decoration-inherit"
                          >
                            {link}
                          </a>
                          {index < set.link.length - 1 && <p>, </p>}
                        </>
                      ))}
                  </div>
                </div>
              </>
            )}
            {set.creatorComments &&
              set.creatorComments !== "" &&
              set.orgUserId !== userId && (
                <>
                  <div className="pt-1 pb-1">
                    <h6 className="text-md">Tracker's Comment:</h6>
                    <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                      <p className="text-sm italic">{set.creatorComments}</p>
                    </div>
                  </div>
                </>
              )}
            {set.recordingRef && set.recordingRef.length > 0 && (
              <>
                <div className="pt-1 pb-1">
                  <h6 className="text-md">Recording(s):</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                    {set.recordingRef.map((recording, index) => (
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
            itemName={set.setName}
            item={"set"}
            itemType={"Set"}
            itemState={set.state}
            itemId={set.setId}
            userId={userId}
            dataFetch={dataFetch}
          />
          <div>
            {set.lastPractice && (
              <p className="text-sm italic pb-1">
                Last Practiced: {lastPracticeStr} ({dateDiffer} days ago)
              </p>
            )}
            {set.creatorComments &&
              set.creatorComments !== "" &&
              set.orgUserId === userId && (
                <>
                  <div className="pt-1 pb-1">
                    <h6 className="text-md">User's Comment:</h6>
                    <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md">
                      <p className="text-sm italic">{set.creatorComments}</p>
                    </div>
                  </div>
                </>
              )}

            {set.comments &&
              set.comments !== "" &&
              set.orgUserId !== userId && (
                <div className="pt-1 pb-1">
                  <h6 className="text-md">User's Comment:</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md">
                    <p className="text-sm italic">{set.comments}</p>
                  </div>
                </div>
              )}

            <div className="pt-1 pb-1">
              <h6 className="text-md">Referenced In:</h6>

              <div className="flex justify-normal flex-wrap non-clickable">
                <p className="text-sm text-green-500 mr-1">Tunes:</p>
                {set.tuneIds.map((tuneId, index) => (
                  <>
                    <a
                      className="text-sm text-blue-400 hover:text-emerald-500"
                      onClick={() => linkClink("tune", tuneId)}
                    >
                      [
                      {set.tuneNames[index].length <= 20
                        ? set.tuneNames[index]
                        : set.tuneNames[index].substring(0, 20) + "..."}
                      ]
                    </a>
                    {index < set.tuneIds.length - 1 && (
                      <p className="mr-1">, </p>
                    )}
                  </>
                ))}
              </div>
              <div className="flex justify-normal flex-wrap non-clickable">
                <p className="text-sm text-green-500 mr-1">Sessions:</p>
                {set.sessionIds.map((sessionId, index) => (
                  <>
                    <a
                      className="text-sm text-blue-400 hover:text-emerald-500"
                      onClick={() => linkClink("session", sessionId)}
                    >
                      [{index}]
                    </a>
                    {index < set.sessionIds.length - 1 && (
                      <p className="mr-1">, </p>
                    )}
                  </>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-grow"></div>
          <div className="flex justify-between pt-1">
            {userId === checkId ? (
              <>
                {userId === set.orgUserId ? (
                  <>
                    <UpdatePractice
                      type={"set"}
                      id={set.setId}
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
                      <UpdateSet
                        type={"set"}
                        itemId={set.setId}
                        set={{
                          ...set,
                          tunes: set.tuneIds.map((id, index) => ({
                            tuneId: id,
                            tuneName: set.tuneNames[index],
                          })),
                        }}
                        dataFetch={dataFetch}
                        userTunes={set.tuneIds.map((id, index) => ({
                          tuneId: id,
                          tuneName: set.tuneNames[index],
                        }))}
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
                      type={"set"}
                      id={set.setId}
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
                      Add Set
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

export default DisplaySet;
