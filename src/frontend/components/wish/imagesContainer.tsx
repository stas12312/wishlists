import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import { MdDragIndicator } from "react-icons/md";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";

import ImageItem, { IUploadImage } from "./imageItem";
export const ImagesContainer = ({
  images,
  setImages,
  onUpload,
  onDelete,
}: {
  images: IUploadImage[];
  setImages: { (images: IUploadImage[]): void };

  onUpload?: { (key: string, url: string): void };
  onDelete?: { (key: string): void };
}) => {
  const [items, setItems] = useState([] as string[]);

  useEffect(() => {
    setItems(
      images.map((image) => {
        return image.key;
      }),
    );
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((image) => image.key == active.id);
      const newIndex = images.findIndex((image) => image.key == over.id);

      setItems(arrayMove(items, oldIndex, newIndex));
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((key) => {
          const image = images.find((img) => img.key === key);
          if (!image) return null;
          return (
            <SortableItem
              key={key}
              image={image}
              onDelete={onDelete}
              onUpload={onUpload}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
};

export function SortableItem({
  image,
  onUpload,
  onDelete,
}: {
  image: IUploadImage;
  onUpload?: { (key: string, url: string): void };
  onDelete?: { (key: string): void };
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ImageItem
        key={image.key}
        endContent={<MdDragIndicator className="text-[32px] my-auto" />}
        uploadImage={image}
        onDelete={onDelete}
        onUpload={onUpload}
      />
    </div>
  );
}
