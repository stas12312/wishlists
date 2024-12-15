"use client";

import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { useDisclosure } from "@nextui-org/modal";
import { Skeleton } from "@nextui-org/skeleton";
import { useRouter } from "next/navigation";
import { Key, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdCreate, MdDelete, MdLink } from "react-icons/md";
import toast from "react-hot-toast";

import { VisibleStatus } from "../visibleIcon";

import WishlistSaveModal from "./saveModal";

import { deleteWishlist } from "@/lib/requests";
import { IWishlist } from "@/lib/models";
import ConfirmationModal from "../confirmation";

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
      className="w-full h-32 flex-col md:hover:scale-[1.03]"
      onPress={() => router.push(`/wishlists/${cardWishlist.uuid}`)}
    >
      <CardHeader className="flex-col items-start">
        <div className="flex flex-row justify-between w-full">
          <div className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden truncate">
            <span className="flex flex-row gap-1">
              <p className="uppercase text-large">{cardWishlist.name}</p>
              <span className="text-small">
                <VisibleStatus visible={cardWishlist.visible} />
              </span>
            </span>
            <p className="text-default-500 text-left">
              {cardWishlist.description}
            </p>
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
            <Chip className="text-default-500 float-right" size="sm">
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
          <div className="h-3 w-3/5 rounded-lg bg-default-200" />
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200" />
        </Skeleton>
      </div>
    </Card>
  );
}

export const WishlistItemMenu = ({
  wishlist,
  onDelete,
  onUpdate,
  className,
}: {
  wishlist: IWishlist;
  onDelete: { (wishlist: IWishlist): void };
  onUpdate: { (wishlist: IWishlist): void };
  className: string;
}) => {
  const { isOpen, onOpenChange } = useDisclosure();
  const [isConfirm, setIsConfirm] = useState(false);

  async function handleOnAction(key: Key) {
    if (key === "delete") {
      setIsConfirm(true);
    }
    if (key === "edit") {
      onOpenChange();
    }
    if (key === "share") {
      navigator.clipboard.writeText(
        `${window.location.origin}/wishlists/${wishlist.uuid}`
      );
      toast.success("Ссылка скопирована");
    }
  }

  async function deleteWishlistByAction() {
    await deleteWishlist(wishlist.uuid);
    onDelete(wishlist);
    setIsConfirm(false);
  }

  function onUpdateWishlist(updadedWishlist: IWishlist): void {
    onOpenChange();
    onUpdate(updadedWishlist);
  }

  return (
    <span>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly as="div" radius="lg" variant="light">
            <BsThreeDotsVertical className={className ?? ""} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions" onAction={handleOnAction}>
          <DropdownSection showDivider>
            <DropdownItem key="edit" startContent={<MdCreate />}>
              Редактировать
            </DropdownItem>
            <DropdownItem key="share" startContent={<MdLink />}>
              Скопировать
            </DropdownItem>
          </DropdownSection>
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
        isOpen={isOpen}
        wishlist={wishlist}
        onOpenChange={onOpenChange}
        onSaveWishlist={onUpdateWishlist}
      />
      <ConfirmationModal
        onConfirm={deleteWishlistByAction}
        isOpen={isConfirm}
        message="Вы действительно хотите удалить вишлист?"
        onDecline={() => {
          setIsConfirm(false);
        }}
      />
    </span>
  );
};

WishlistItemMenu.defaultProps = {
  className: "",
};
