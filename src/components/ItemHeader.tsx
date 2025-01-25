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
    <div className="flex flex-row justify-between items-center">
      {itemName && itemName.length < 26 ? (
        <h5 className="basis-6/12 text-md font-semibold text-cyan-600">
          {itemName}
        </h5>
      ) : (
        <h5 className="basis-6/12 text-md font-semibold text-cyan-600">
          {itemName.substring(0, 25)}...
        </h5>
      )}
      <p className="basis-2/12 text-center text-sm text-gray-400 italic">
        {itemType}
      </p>
      <div className="basis-4/12 flex justify-end non-clickable">
        <ItemState
          state={itemState}
          item={item}
          id={itemId}
          userId={userId}
          dataFetch={dataFetch}
        />
      </div>
    </div>
  );
};

export default ItemHeader;
