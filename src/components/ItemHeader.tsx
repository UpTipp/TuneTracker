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
      <h5 className="basis-2/5 text-lg font-semibold text-cyan-600">
        {itemName}
      </h5>
      <p className="basis-1/5 text-center text-md text-gray-400 italic">
        {itemType}
      </p>
      <div className="basis-2/5 flex justify-end">
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
