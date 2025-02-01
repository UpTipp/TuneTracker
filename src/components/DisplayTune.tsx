import { useState } from "react";
import { Card, Button, Modal, HR } from "flowbite-react";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import ItemHeader from "./ItemHeader";
import Cookie from "js-cookie";
import UpdatePractice from "./UpdatePractice";
import UpdateTune from "./UpdateTune";
import AddItem from "./AddItem";
import CopyItem from "./CopyItem";
import AudioPlayer from "./AudioPlayer";
import ItemState from "./ItemState";

const customCard = {
  root: {
    children: "flex h-full flex-col justify-normal gap-4 p-6",
  },
};

function checkCardClick(e: React.MouseEvent<HTMLElement>) {
  const tagName = (e.target as HTMLElement).tagName.toLowerCase();
  const className = (e.target as HTMLElement).className;
  const closest = (e.target as HTMLElement).closest(".non-clickable");
  console.log("Checking: ", e.target);
  console.log(
    tagName !== "button" &&
      tagName !== "a" &&
      tagName !== "select" &&
      !closest &&
      !(tagName === "DIV" && className.includes("itemState"))
  );
  // Prevent modal if clicking on a link or button
  return (
    tagName !== "button" &&
    tagName !== "a" &&
    tagName !== "select" &&
    !closest &&
    !(tagName === "DIV" && className.includes("itemState"))
  );
}

const DisplayTune = ({ tune, userId, dataFetch, goTo, itemMemory }) => {
  const checkId = JSON.parse(Cookie.get("user") || "{}").id;
  const [showModal, setShowModal] = useState(false);
  const [currentTune, setCurrentTune] = useState(tune); // Add state for current tune

  const hasBackContent =
    (tune.links && tune.links.length > 0) ||
    (tune.creatorComments && tune.creatorComments !== "") ||
    (tune.recordingRef && tune.recordingRef.length > 0) ||
    (tune.setIds && tune.setIds.length > 2) ||
    (tune.sessionIds && tune.sessionIds.length > 2);

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if (checkCardClick(e) && hasBackContent) {
      setShowModal(true);
      setCurrentTune(tune); // Set the current tune when the modal is opened
    }
  };

  const linkClink = (type: string, id: string) => {
    goTo(type, id);
    itemMemory("tune", tune.tuneId);
  };

  let dateAdded = tune.dateAdded ? new Date(tune.dateAdded) : null;
  let lastPractice = tune.lastPractice
    ? new Date(tune.lastPractice)
    : new Date();
  const dateDiffer = Math.floor(
    (Date.now() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
  );

  let dateAddedStr = dateAdded ? dateAdded.toDateString() : null;
  let lastPracticeStr = lastPractice ? lastPractice.toDateString() : null;

  return (
    <>
      <Card
        onClick={handleCardClick}
        theme={customCard}
        id={"tu:" + tune.tuneId}
        className="w-full max-w-lg border-2 hover:border-blue-400 flex flex-col justify-between"
      >
        <ItemHeader
          itemName={tune.tuneName}
          item={"tune"}
          itemType={tune.tuneType}
          itemState={tune.state}
          itemId={tune.tuneId}
          userId={userId}
          dataFetch={dataFetch}
        />
        <div>
          {tune.tuneKey &&
          Array.isArray(tune.tuneKey) &&
          tune.tuneKey.length > 0 ? (
            <p className="text-sm">Key(s): {tune.tuneKey.join(", ")}</p>
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

          <div className="pt-1 pb-1">
            <h6 className="text-md">Referenced In:</h6>

            <div className="flex justify-normal flex-wrap non-clickable">
              <p className="text-sm text-green-500 mr-1">Sets:</p>
              {tune.setIds.map((setId, index) => (
                <>
                  <a
                    className="text-sm text-blue-400 hover:text-emerald-500"
                    onClick={() => linkClink("set", setId)}
                  >
                    [
                    {tune.setNames[index].length <= 20
                      ? tune.setNames[index]
                      : tune.setNames[index].substring(0, 20) + "..."}
                    ]
                  </a>
                  {index < 2
                    ? index < tune.setIds.length - 1 && (
                        <p className="mr-1">,</p>
                      )
                    : index < tune.setIds.length - 1 && (
                        <p className="mr-1">, ...</p>
                      )}
                </>
              ))}
            </div>
            <div className="flex justify-normal flex-wrap non-clickable">
              <p className="text-sm text-green-500 mr-1">Sessions:</p>
              {tune.sessionIds.map((sessionId, index) => (
                <>
                  <a
                    className="text-sm text-blue-400 hover:text-emerald-500"
                    onClick={() => linkClink("session", sessionId)}
                  >
                    [{index}]
                  </a>
                  {index < 2
                    ? index < tune.sessionIds.length - 1 && (
                        <p className="mr-1">,</p>
                      )
                    : index < tune.sessionIds.length - 1 && (
                        <p className="mr-1">, ...</p>
                      )}
                </>
              ))}
            </div>
          </div>
        </div>
        <div>
          <HR className="my-1" />
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
                        tune={currentTune} // Pass the current tune
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
        </div>
      </Card>

      <Modal
        dismissible
        size={"lg"}
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <Modal.Header className="mb-2 text-lg font-semibold text-cyan-600">
          {tune.tuneName}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-row justify-between items-center">
            <p className="text-center text-sm text-gray-400 italic">
              {tune.tuneType}
            </p>
            <div className="flex justify-end">
              <ItemState
                state={tune.state}
                item={"tune"}
                id={tune.tuneId}
                userId={userId}
                dataFetch={dataFetch}
              />
            </div>
          </div>

          <div>
            {tune.tuneKey &&
            Array.isArray(tune.tuneKey) &&
            tune.tuneKey.length > 0 ? (
              <p className="text-sm">Key: {tune.tuneKey.join(", ")}</p>
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

            {tune.dateAdded && (
              <p className="text-sm italic pb-1"> Date Added: {dateAddedStr}</p>
            )}
            <div>
              {/* Refernced In */}
              <div className="pt-1 pb-1">
                <h6 className="text-md">Referenced In:</h6>

                <div className="flex justify-normal flex-wrap non-clickable">
                  <p className="text-sm text-green-500 mr-1">Sets:</p>
                  {tune.setIds.map((setId, index) => (
                    <>
                      <a
                        className="text-sm text-blue-400 hover:text-emerald-500"
                        onClick={() => linkClink("set", setId)}
                      >
                        [
                        {tune.setNames[index].length <= 20
                          ? tune.setNames[index]
                          : tune.setNames[index].substring(0, 20) + "..."}
                        ]
                      </a>

                      {index < tune.setIds.length - 1 && (
                        <p className="mr-1">,</p>
                      )}
                    </>
                  ))}
                </div>
                <div className="flex justify-normal flex-wrap non-clickable">
                  <p className="text-sm text-green-500 mr-1">Sessions:</p>
                  {tune.sessionIds.map((sessionId, index) => (
                    <>
                      <a
                        className="text-sm text-blue-400 hover:text-emerald-500"
                        onClick={() => linkClink("session", sessionId)}
                      >
                        [{index}]
                      </a>
                      {index < tune.sessionIds.length - 1 && (
                        <p className="mr-1">, </p>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </div>

            {tune.links && tune.links.length > 0 && (
              <>
                <div className="pt-1 pb-1">
                  <h6 className="text-md mb-1">Links:</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md justify-normal non-clickable">
                    {Array.isArray(tune.links) &&
                      tune.links.length > 0 &&
                      tune.links.map((link, index) => (
                        <>
                          <div>
                            <a
                              key={index}
                              href={link}
                              className="text-blue-600 text-sm w-min underline decoration-inherit"
                            >
                              {link}
                            </a>
                          </div>
                        </>
                      ))}
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
                      <AudioPlayer
                        key={`${tune.tuneId}-${recording}-${index}`} // combines tuneId with recording
                        url={recording}
                        className="ml-2"
                      />
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

            {tune.creatorComments &&
              tune.creatorComments !== "" &&
              tune.orgUserId === userId && (
                <>
                  <div className="pt-1 pb-1">
                    <h6 className="text-md">Your Comment:</h6>
                    <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                      <p className="text-sm italic">{tune.creatorComments}</p>
                    </div>
                  </div>
                </>
              )}
          </div>
          <HR className="my-1 mt-3" />
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
                    <div
                      className="flex justify-center items-center"
                      onClick={() => setShowModal(false)}
                    >
                      <IoIosArrowDropleftCircle className="arrow opacity-60" />
                    </div>
                    <div className="non-clickable">
                      <UpdateTune
                        type={"tune"}
                        itemId={tune.tuneId}
                        tune={currentTune} // Pass the current tune
                        dataFetch={dataFetch}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <CopyItem />
                    <div className="flex justify-center items-center">
                      <IoIosArrowDropleftCircle
                        className="arrow opacity-60"
                        onClick={() => setShowModal(false)}
                      />
                    </div>
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
                    <div className="flex justify-center items-center">
                      <IoIosArrowDropleftCircle
                        className="arrow opacity-60"
                        onClick={() => setShowModal(false)}
                      />
                    </div>
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
                    <div className="flex justify-center items-center">
                      <IoIosArrowDropleftCircle
                        className="arrow opacity-60"
                        onClick={() => setShowModal(false)}
                      />
                    </div>
                    <Button className="bg-blue-400" disabled>
                      Add Tune
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DisplayTune;
