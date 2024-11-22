import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Label } from "flowbite-react";
import SortableItem from "./SortableItem";

interface DraggableListProps {
  items: Array<{ id: string; name: string }>;
  label: string;
  onDragEnd: (event: any) => void;
  onRemove: (id: string) => void;
}

const DraggableList = ({
  items,
  label,
  onDragEnd,
  onRemove,
}: DraggableListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="mt-4">
      <Label value={label} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-2">
            {items.map((item) => (
              <SortableItem key={item.id} item={item} onRemove={onRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DraggableList;
