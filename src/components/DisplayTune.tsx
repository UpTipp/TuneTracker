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
import UpdateTune from "./UpdateTune";
import AddItem from "./AddItem";
import CopyItem from "./CopyItem";

const customCard = {
  root: {
    children: "flex h-full flex-col justify-normal gap-4 p-6",
  },
};

const DisplayTune = ({ tune, userId, dataFetch }) => {
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

  let dateAdded = tune.dateAdded ? new Date(tune.dateAdded) : null;
  let lastPractice = tune.lastPractice ? new Date(tune.lastPractice) : null;
  const dateDiffer = Math.floor(
    (Date.now() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
  );

  let dateAddedStr = dateAdded ? dateAdded.toDateString() : null;
  let lastPracticeStr = lastPractice ? lastPractice.toDateString() : null;

  const hasBackContent =
    (tune.link && tune.link.length > 0) ||
    (tune.creatorComments && tune.creatorComments !== "") ||
    (tune.recordingRef && tune.recordingRef.length > 0);

  return (
    <Card
      onClick={hasBackContent ? handleCardClick : undefined}
      theme={customCard}
      id={"tu:" + tune.tuneId}
      className="w-full max-w-lg hover:border-blue-400 flex flex-col justify-between"
    >
      {isFlipped ? (
        // Back of card
        <>
          <ItemHeader
            itemName={tune.tuneName}
            item={"tune"}
            itemType={tune.tuneType}
            itemState={tune.state}
            itemId={tune.tuneId}
            userId={userId}
          />
          <div>
            {tune.link && tune.link.length > 0 && (
              <>
                <div className="pt-1 pb-1">
                  <h6 className="text-md mb-1">Links:</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md flex justify-normal flex-wrap non-clickable">
                    {Array.isArray(tune.link) &&
                      tune.link.length > 0 &&
                      tune.link.map((link, index) => (
                        <>
                          <a
                            key={index}
                            href={link}
                            className="text-blue-600 text-sm w-min underline decoration-inherit"
                          >
                            {link}
                          </a>
                          {index < tune.link.length - 1 && <p>, </p>}
                        </>
                      ))}
                  </div>
                </div>
              </>
            )}
            {tune.creatorComments &&
              tune.creatorComments !== "" &&
              tune.orgUserId !== userId && (
                <>
                  <div className="pt-1 pb-1">
                    <h6 className="text-md">Tracker's Comment:</h6>
                    <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                      <p className="text-sm italic">{tune.creatorComments}</p>
                    </div>
                  </div>
                </>
              )}
            {tune.recordingRef && tune.recordingRef.length > 0 && (
              <>
                <div className="pt-1 pb-1">
                  <h6 className="text-md">Recording(s):</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                    {tune.recordingRef.map((recording, index) => (
                      <ReactPlayer
                        key={index}
                        url={recording}
                        controls
                        width="100%"
                        height="50px"
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
            itemName={tune.tuneName}
            item={"tune"}
            itemType={tune.tuneType}
            itemState={tune.state}
            itemId={tune.tuneId}
            userId={userId}
          />
          <div>
            {tune.tuneKey && tune.tuneKey !== "" ? (
              <p className="text-sm">Key: {tune.tuneKey}</p>
            ) : (
              <p className="text-sm">[Unspecified Key]</p>
            )}

            {tune.author && tune.author !== "" ? (
              <p className="">Author: {tune.author}</p>
            ) : (
              <p className="">[Unspecified Author]</p>
            )}

            {tune.lastPractice && (
              <p className="text-sm italic pb-1">
                {" "}
                Last Practiced: {lastPracticeStr} ({dateDiffer} days ago)
              </p>
            )}

            {tune.creatorComments &&
              tune.creatorComments !== "" &&
              tune.orgUserId === userId && (
                <>
                  <div className="pt-1 pb-1">
                    <h6 className="text-md">User's Comment:</h6>
                    <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md">
                      <p className="text-sm italic">{tune.creatorComments}</p>
                    </div>
                  </div>
                </>
              )}

            {tune.comments &&
              tune.comments !== "" &&
              tune.orgUserId !== userId && (
                <div className="pt-1 pb-1">
                  <h6 className="text-md">User's Comment:</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md">
                    <p className="text-sm italic">{tune.comments}</p>
                  </div>
                </div>
              )}

            <div className="pt-1 pb-1">
              <h6 className="text-md">Referenced In:</h6>

              <div className="flex justify-normal flex-wrap non-clickable">
                <p className="text-sm text-green-500">Sets:</p>
                {tune.setIds.map((setId, index) => (
                  <>
                    <a
                      className="text-sm text-blue-400 hover:text-emerald-500"
                      href={"st:" + setId}
                    >
                      [{tune.setName[index].substring(0, 20)}...]
                    </a>
                    {index < tune.link.length - 1 && <p>, </p>}
                  </>
                ))}
              </div>
              <div className="flex justify-normal flex-wrap non-clickable">
                <p className="text-sm text-green-500">Sessions:</p>
                {tune.sessionIds.map((sessionId, index) => (
                  <>
                    <a
                      className="text-sm text-blue-400 hover:text-emerald-500"
                      href={"se:" + sessionId}
                    >
                      [{index}]
                    </a>
                    {index < tune.link.length - 1 && <p>, </p>}
                  </>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-grow"></div>
          <div className="flex justify-between pt-1">
            {userId === checkId ? (
              <>
                {userId === tune.orgUserId ? (
                  <>
                    <UpdatePractice
                      type={"tune"}
                      id={tune.tuneId}
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
                      <UpdateTune
                        type={"tune"}
                        itemId={tune.tuneId}
                        tune={tune}
                        dataFetch={dataFetch}
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
                      type={"tune"}
                      id={tune.tuneId}
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
                      Add Tune
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

export default DisplayTune;
