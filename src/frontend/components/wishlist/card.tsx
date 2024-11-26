"use client";

import { IWishlist } from "@/lib/models";
import { deleteWishlist } from "@/lib/requests";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { useDisclosure } from "@nextui-org/modal";
import { Skeleton } from "@nextui-org/skeleton";
import { useRouter } from "next/navigation";
import { Key, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdCreate, MdDelete } from "react-icons/md";
import { VisibleStatus } from "../visibleIcon";
import WishlistSaveModal from "./saveModal";

export function WishlistItem({
  wishlist,
  onDelete,
}: {
  wishlist: IWishlist;
  onDelete: { (wishlist: IWishlist): void };
}) {
  const router = useRouter();

  const [cardWishlist, setCardWishlist] = useState<IWishlist>(wishlist);

  function onUpdate(wishlist: IWishlist): void {
    setCardWishlist(wishlist);
  }

  return (
    <Card
      isPressable
      onPress={() => router.push(`/wishlists/${cardWishlist.uuid}`)}
      className="w-full h-32 flex-col"
    >
      <CardHeader className="flex-col items-start">
        <div className="flex flex-row justify-between w-full">
          <div className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden truncate">
            <p className="uppercase flex flex-row gap-1 text">
              <span>
                <VisibleStatus visible={cardWishlist.visible} />
              </span>
              {cardWishlist.name}
            </p>
            <small className="text-default-500 text-left">
              {cardWishlist.description}
            </small>
          </div>
          <div>
            <WishlistItemMenu
              wishlist={cardWishlist}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody className="justify-end">
        <div className="flow-root">
          {cardWishlist.date ? (
            <Chip size="sm" className="text-default-500 float-right">
              {new Date(cardWishlist.date).toLocaleDateString()}
            </Chip>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

export function WishlistsSkeletonItem() {
  return (
    <Card className="space-y-5 p-4 h-32" radius="lg">
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
      </div>
    </Card>
  );
}

export function WishlistItemMenu({
  wishlist,
  onDelete,
  onUpdate,
}: {
  wishlist: IWishlist;
  onDelete: { (wishlist: IWishlist): void };
  onUpdate: { (wishlist: IWishlist): void };
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  async function handleOnAction(key: Key) {
    if (key === "delete") {
      await deleteWishlist(wishlist.uuid);
      onDelete(wishlist);
    }
    if (key === "edit") {
      onOpenChange();
    }
  }

  function onUpdateWishlist(updadedWishlist: IWishlist): void {
    onOpenChange();
    onUpdate(updadedWishlist);
  }
  console.log(wishlist);

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
      <WishlistSaveModal
        onOpenChange={onOpenChange}
        wishlist={wishlist}
        isOpen={isOpen}
        onSaveWishlist={onUpdateWishlist}
      />
    </span>
  );
}
