"use client";
import { IWish } from "@/lib/models";
import { deleteWish } from "@/lib/requests";
import userStore from "@/store/userStore";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Image } from "@nextui-org/image";
import { useDisclosure } from "@nextui-org/modal";
import { Key, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdCreate, MdDelete } from "react-icons/md";
import WishSaveModal from "./saveModal";
export function WishItemMenu({
  wish,
  onDelete,
  onUpdate,
}: {
  wish: IWish;
  onDelete: { (wish: IWish): void };
  onUpdate: { (wish: IWish): void };
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  async function handleOnAction(key: Key) {
    if (key === "delete" && wish.uuid) {
      await deleteWish(wish.uuid);
      onDelete(wish);
    }
    if (key === "edit") {
      onOpenChange();
    }
  }

  async function onWishUpdate(wish: IWish) {
    onOpenChange();
    onUpdate(wish);
  }

  return (
    <span>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant="light" radius="lg" as="div">
            <BsThreeDotsVertical />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions" onAction={handleOnAction}>
          <DropdownItem key="edit" startContent={<MdCreate />}>
            Редактировать
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={<MdDelete />}
          >
            Удалить
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <WishSaveModal
        onOpenChange={onOpenChange}
        onUpdate={onWishUpdate}
        wish={wish}
        isOpen={isOpen}
        wishlistUUID={wish.wishlist_uuid}
      />
    </span>
  );
}

export function WishItem({
  wish,
  isEditable,
  onDelete,
}: {
  wish: IWish;
  isEditable: boolean;
  onDelete: { (wish: IWish): void };
}) {
  const [item, setItem] = useState<IWish>(wish);
  const user = userStore.user;
  return (
    <Card
      className="flex-col h-[300px] md:hover:scale-105 w-full"
      isPressable={item.link !== null && item.link != ""}
      onPress={(e) => {
        window.open(item.link);
      }}
    >
      <CardHeader className="flex-col items-start">
        <div className="flex flex-row justify-between w-full">
          <p className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden text-ellipsis truncate">
            <span className="uppercase text-xl">{item.name}</span>
            <span className="text-default-500">{item.comment}</span>
          </p>
          {isEditable ? (
            <span>
              <WishItemMenu
                wish={item}
                onDelete={onDelete}
                onUpdate={setItem}
              />
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardBody>
        <Image
          removeWrapper
          className="z-0 object-cover w-full h-full"
          src={item.image ? item.image : undefined}
        />
      </CardBody>
      {item.cost ? (
        <CardFooter className="z-10 absolute bottom-1 right-1 justify-end">
          <Chip size="sm">{item.cost.toLocaleString() + " ₽"}</Chip>
        </CardFooter>
      ) : null}
    </Card>
  );
}
