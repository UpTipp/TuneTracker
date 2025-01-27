import { HR } from "flowbite-react";
import ItemState from "./ItemState";

const ItemHeader = ({
  itemName,
  item,
  itemType,
  itemState,
  itemId,
  userId,
  dataFetch,
}) => {
  return (
    <>
      <div className="flex flex-col justify-between">
        <div>
          {itemName && itemName.length < 26 ? (
            <h5 className="basis-8/12 text-lg font-semibold text-cyan-600">
              {itemName}
            </h5>
          ) : (
            <h5 className="basis-8/12 text-lg font-semibold text-cyan-600">
              {itemName.substring(0, 25)}...
            </h5>
          )}
        </div>
        <div className="flex flex-row justify-between items-center">
          <p className="basis-1/2 text-md text-gray-400 italic">{itemType}</p>
          <div className="basis-1/2 flex justify-end non-clickable">
            <ItemState
              state={itemState}
              item={item}
              id={itemId}
              userId={userId}
              dataFetch={dataFetch}
            />
          </div>
        </div>
        <HR className="my-1" />
      </div>
    </>
  );
};

export default ItemHeader;
