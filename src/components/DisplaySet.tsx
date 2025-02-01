import { useState } from "react";
import { Card, Button, HR, Modal } from "flowbite-react";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import ItemHeader from "./ItemHeader";
import Cookie from "js-cookie";
import UpdatePractice from "./UpdatePractice";
import UpdateSet from "./UpdateSet";
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

const DisplaySet = ({ set, userId, dataFetch, goTo, itemMemory, allTunes }) => {
  const checkId = JSON.parse(Cookie.get("user") || "{}").id;
  const [showModal, setShowModal] = useState(false);

  const hasBackContent =
    (set.link && set.link.length > 0) ||
    (set.creatorComments && set.creatorComments !== "") ||
    (set.recordingRef && set.recordingRef.length > 0) ||
    (set.tuneIds && set.tuneIds.length > 2) ||
    (set.sessionIds && set.sessionIds.length > 2);

  const handleCardClick = (event) => {
    if (checkCardClick(event) && hasBackContent) {
      setShowModal(true);
    }
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

  return (
    <>
      <Card
        onClick={hasBackContent ? handleCardClick : undefined}
        theme={customCard}
        id={"se:" + set.setId}
        className="w-full max-w-lg border-2 hover:border-blue-400 flex flex-col justify-between"
      >
        <ItemHeader
          itemName={set.setName}
          item={"set"}
          itemType={set.tuneTypes.length > 0 ? set.tuneTypes.join(", ") : "Set"}
          itemState={set.state}
          itemId={set.setId}
          userId={userId}
          dataFetch={dataFetch}
        />
        <div>
          {set.lastPractice && (
            <p className="text-sm italic pb-1">
              {" "}
              Last Practiced: {lastPracticeStr} ({dateDiffer} days ago)
            </p>
          )}

          <div className="pt-1 pb-1">
            <h6 className="text-md">Referenced In:</h6>

            <div className="flex justify-normal flex-wrap non-clickable">
              <p className="text-sm text-green-500 mr-1">Tunes:</p>
              {set.tuneIds.slice(0, 2).map((tuneId, index) => (
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
                  {index < set.tuneIds.slice(0, 2).length - 1 && (
                    <p className="mr-1">,</p>
                  )}
                </>
              ))}
              {set.tuneIds.length > 2 && <p className="mr-1">, ...</p>}
            </div>
            <div className="flex justify-normal flex-wrap non-clickable">
              <p className="text-sm text-green-500 mr-1">Sessions:</p>
              {set.sessionIds.slice(0, 2).map((sessionId, index) => (
                <>
                  <a
                    className="text-sm text-blue-400 hover:text-emerald-500"
                    onClick={() => linkClink("session", sessionId)}
                  >
                    [{index}]
                  </a>
                  {index < set.sessionIds.slice(0, 2).length - 1 && (
                    <p className="mr-1">,</p>
                  )}
                </>
              ))}
              {set.sessionIds.length > 2 && <p className="mr-1">, ...</p>}
            </div>
          </div>
        </div>
        <div>
          <HR className="my-1" />
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
                        allTunes={allTunes}
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
        </div>
      </Card>
      <Modal
        dismissible
        size={"lg"}
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <Modal.Header className="mb-2 text-lg font-semibold text-cyan-600">
          {set.setName}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-row justify-between items-center">
            <p className="text-center text-sm text-gray-400 italic">
              {set.tuneTypes.length > 0 ? set.tuneTypes.join(", ") : "Set"}
            </p>
            <div className="flex justify-end">
              <ItemState
                state={set.state}
                item={"set"}
                id={set.setId}
                userId={userId}
                dataFetch={dataFetch}
              />
            </div>
          </div>
          <div>
            {set.lastPractice && (
              <p className="text-sm italic pb-1">
                {" "}
                Last Practiced: {lastPracticeStr} ({dateDiffer} days ago)
              </p>
            )}
            {set.dateAdded && (
              <p className="text-sm italic pb-1"> Date Added: {dateAddedStr}</p>
            )}
            <div>
              {/* Referenced In */}
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
                        <p className="mr-1">,</p>
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
                        <p className="mr-1">,</p>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </div>

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

            {set.recordingRef && set.recordingRef.length > 0 && (
              <>
                <div className="pt-1 pb-1">
                  <h6 className="text-md">Recording(s):</h6>
                  <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                    {set.recordingRef.map((recording, index) => (
                      <AudioPlayer
                        key={`${set.setId}-${recording}-${index}`} // combines setId with recording
                        url={recording}
                        className="ml-2"
                      />
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

            {set.creatorComments &&
              set.creatorComments !== "" &&
              set.orgUserId === userId && (
                <>
                  <div className="pt-1 pb-1">
                    <h6 className="text-md">Your Comment:</h6>
                    <div className="p-2 border border-gray-600 bg-gray-300 bg-opacity-50 rounded-md non-clickable">
                      <p className="text-sm italic">{set.creatorComments}</p>
                    </div>
                  </div>
                </>
              )}
          </div>

          {/* Bottom */}
          <HR className="my-1 mt-3" />
          <div className="flex justify-between pt-1">
            {userId === checkId ? (
              <>
                {userId === set.orgUserId ? (
                  <>
                    <UpdatePractice
                      type={"tune"}
                      id={set.setId}
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
                        allTunes={allTunes}
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
                    <div className="flex justify-center items-center">
                      <IoIosArrowDropleftCircle
                        className="arrow opacity-60"
                        onClick={() => setShowModal(false)}
                      />
                    </div>
                    <UpdatePractice
                      type={"tune"}
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
                      Add Set
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

export default DisplaySet;
