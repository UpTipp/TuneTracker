import { Button } from "flowbite-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";

interface SortableItemProps {
  item: { id: string; name: string };
  onRemove: (id: string) => void;
}

const SortableItem = ({ item, onRemove }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 mb-1 rounded"
    >
      <div
        className="flex items-center flex-grow cursor-move"
        {...attributes}
        {...listeners}
      >
        <MdDragIndicator />
        <span className="ml-2">{item.name}</span>
      </div>
      <Button
        onClick={() => onRemove(item.id)}
        className="ml-2"
        size="xs"
        color="red"
      >
        Remove
      </Button>
    </div>
  );
};

export default SortableItem;
