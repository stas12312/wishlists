"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/modal";
import { Skeleton } from "@heroui/skeleton";
import { useRouter } from "next/navigation";
import { forwardRef, Key, useState } from "react";
import toast from "react-hot-toast";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdCreate, MdDelete, MdLink, MdRestoreFromTrash } from "react-icons/md";

import { VisibleStatus } from "../visibleIcon";
import ConfirmationModal from "../confirmation";

import WishlistSaveModal from "./saveModal";

import { getLabelForCount } from "@/lib/label";
import { IWishlist } from "@/lib/models/wishlist";
import { deleteWishlist, restoreWishlist } from "@/lib/requests";

export const WishlistItem = forwardRef(
  (
    {
      wishlist,
      onDelete,
      onRestore,
      edit = true,
    }: {
      wishlist: IWishlist;
      onDelete: { (wishlist: IWishlist): void };
      onRestore: { (wishlist: IWishlist): void };
      edit?: boolean;
    },
    ref: any,
  ) => {
    const router = useRouter();

    const [cardWishlist, setCardWishlist] = useState<IWishlist>(wishlist);

    function onUpdate(wishlist: IWishlist): void {
      setCardWishlist(wishlist);
    }

    return (
      <div className="md:hover:scale-[1.03] duration-200">
        <Card
          ref={ref}
          className="w-full h-40 flex-col"
          isPressable={wishlist.is_active}
          onPress={() => router.push(`/wishlists/${cardWishlist.uuid}`)}
        >
          <CardHeader className="flex-col items-start">
            <div className="flex flex-row justify-between w-full">
              <div className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden truncate">
                <span
                  className={`flex flex-row gap-1 ${!wishlist.is_active ? "text-default-400" : ""}`}
                >
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
                {edit ? (
                  <WishlistItemMenu
                    isEditable={true}
                    wishlist={cardWishlist}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onUpdate={onUpdate}
                  />
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardBody className="justify-end">
            <div className="flow-root">
              <span className=" float-right flex flex-col gap-1">
                <Chip className="mr-0 ml-auto" color="primary">
                  {cardWishlist.wishes_count > 0
                    ? wishlist.wishes_count
                    : "Нет"}{" "}
                  {getLabelForCount(cardWishlist.wishes_count, [
                    "желание",
                    "желания",
                    "желаний",
                  ])}
                </Chip>
                {cardWishlist.date ? (
                  <Chip className="text-default-500 mr-0 ml-auto">
                    {new Date(cardWishlist.date).toLocaleDateString()}
                  </Chip>
                ) : null}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  },
);

export function WishlistsSkeletonItem() {
  return (
    <Card className="space-y-5 p-4 h-40" radius="lg">
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
  onRestore,
  className,
  isEditable,
}: {
  wishlist: IWishlist;
  onDelete: { (wishlist: IWishlist): void };
  onUpdate: { (wishlist: IWishlist): void };
  onRestore: { (wishlist: IWishlist): void };
  className: string;
  isEditable: boolean;
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
        `${window.location.origin}/wishlists/${wishlist.uuid}`,
      );
      toast.success("Ссылка скопирована");
    }
    if (key === "restore") {
      await restoreWishlist(wishlist.uuid);
      onRestore(wishlist);
      toast.success("Вишлист восстановлен");
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
          {isEditable ? (
            <>
              <DropdownSection showDivider>
                {wishlist.is_active ? (
                  <>
                    <DropdownItem key="edit" startContent={<MdCreate />}>
                      Редактировать
                    </DropdownItem>

                    <DropdownItem key="share" startContent={<MdLink />}>
                      Скопировать
                    </DropdownItem>
                  </>
                ) : (
                  <DropdownItem
                    key="restore"
                    className="text-primary"
                    color="primary"
                    startContent={<MdRestoreFromTrash />}
                  >
                    Восстановить
                  </DropdownItem>
                )}
              </DropdownSection>

              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<MdDelete />}
              >
                {wishlist.is_active ? "Архивировать" : "Удалить"}
              </DropdownItem>
            </>
          ) : (
            <DropdownItem key="share" startContent={<MdLink />}>
              Скопировать
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
      <WishlistSaveModal
        isOpen={isOpen}
        wishlist={wishlist}
        onOpenChange={onOpenChange}
        onSaveWishlist={onUpdateWishlist}
      />
      <ConfirmationModal
        isOpen={isConfirm}
        message={`Вы действительно хотите ${wishlist.is_active ? "архивировать" : "удалить"} вишлист?`}
        onConfirm={deleteWishlistByAction}
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

WishlistItem.displayName = "WishlistItem";
