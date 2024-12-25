"use client";
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
import {
  MdCreate,
  MdDelete,
  MdOutlineBookmarkAdded,
  MdOutlineBookmarkRemove,
} from "react-icons/md";

import WishSaveModal from "./saveModal";

import { IWish, WishActions } from "@/lib/models";
import {
  cancelReserveWish,
  deleteWish,
  getWish,
  reserveWish,
} from "@/lib/requests";
import ConfirmationModal from "../confirmation";
import { observer } from "mobx-react-lite";
import userStore from "@/store/userStore";
import toast from "react-hot-toast";

export function WishItemMenu({
  wish,
  onDelete,
  onUpdate,
  onReserve,
  onCancelReserve,
  actions,
}: {
  wish: IWish;
  onDelete: { (wish: IWish): void };
  onUpdate: { (wish: IWish): void };
  onReserve: { (wish: IWish): void };
  onCancelReserve: { (wish: IWish): void };
  actions: WishActions;
}) {
  const { isOpen, onOpenChange } = useDisclosure();
  const [isConfirm, setIsConfirm] = useState(false);

  async function handleOnAction(key: Key) {
    if (key === "delete" && wish.uuid) {
      setIsConfirm(true);
    }
    if (key === "edit") {
      onOpenChange();
    }
    if (key === "reserve") {
      onReserve(wish);
    }
    if (key === "cancel_reserve") {
      onCancelReserve(wish);
    }
  }

  async function onDeleteWish() {
    await deleteWish(wish.uuid ?? "");
    onDelete(wish);
    setIsConfirm(false);
  }

  async function onWishUpdate(wish: IWish) {
    onOpenChange();
    onUpdate(wish);
  }

  return (
    <span>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly as="div" radius="lg" variant="light">
            <BsThreeDotsVertical />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Wish actions" onAction={handleOnAction}>
          {actions.canEdit ? (
            <DropdownItem key="edit" startContent={<MdCreate />}>
              Редактировать
            </DropdownItem>
          ) : null}

          {actions.canReserve ? (
            <DropdownItem
              key="reserve"
              color="primary"
              className="text-primary"
              startContent={<MdOutlineBookmarkAdded />}
            >
              Забронировать
            </DropdownItem>
          ) : null}
          {actions.canCancelReserve ? (
            <DropdownItem
              key="cancel_reserve"
              className="text-danger"
              color="danger"
              startContent={<MdOutlineBookmarkRemove />}
            >
              Отменить бронь
            </DropdownItem>
          ) : null}
          {actions.canEdit ? (
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<MdDelete />}
            >
              Удалить
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </Dropdown>
      <WishSaveModal
        isOpen={isOpen}
        wish={wish}
        wishlistUUID={wish.wishlist_uuid}
        onOpenChange={onOpenChange}
        onUpdate={onWishUpdate}
      />
      <ConfirmationModal
        onConfirm={onDeleteWish}
        isOpen={isConfirm}
        message="Вы действительно хотите удалить желание?"
        onDecline={() => {
          setIsConfirm(false);
        }}
      />
    </span>
  );
}

export const WishItem = observer(
  ({
    wish,
    onDelete,
    canCancelReserve = false,
  }: {
    wish: IWish;
    onDelete: { (wish: IWish): void };
    canCancelReserve?: boolean;
  }) => {
    const [item, setItem] = useState<IWish>(wish);
    const userId = userStore.user.id;

    return (
      <Card
        className="flex-col h-[300px] md:hover:scale-[1.03] w-full"
        isPressable={item.link !== null && item.link != ""}
        onPress={() => {
          window.open(item.link);
        }}
      >
        <CardHeader className="flex-col items-start">
          <div className="flex flex-row justify-between w-full h-[40px]">
            <p className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden text-ellipsis truncate">
              <span className="uppercase text-xl">{item.name}</span>
              <span className="text-default-500">{item.comment}</span>
            </p>
            {userId &&
            (userId == item.user_id ||
              !item.is_reserved ||
              canCancelReserve) ? (
              <span>
                <WishItemMenu
                  wish={item}
                  onDelete={onDelete}
                  onUpdate={setItem}
                  onReserve={async (wish) => {
                    const wishUUID = wish.uuid ?? "";
                    const result = await reserveWish(wishUUID);
                    if (result) {
                      toast.error(result.message);
                    } else {
                      setItem(await getWish(wishUUID));
                      toast.success("Желание забронировано");
                    }
                  }}
                  onCancelReserve={async (wish) => {
                    const wishUUID = wish.uuid ?? "";
                    const result = await cancelReserveWish(wishUUID);
                    if (result) {
                      toast.error(result.message);
                    } else {
                      setItem(await getWish(wishUUID));
                      toast.success("Бронь отменена");
                    }
                  }}
                  actions={{
                    canEdit: userId == item.user_id,
                    canCancelReserve: canCancelReserve && item.is_reserved,
                    canReserve: userId != item.user_id && !item.is_reserved,
                  }}
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
        <CardFooter className="z-10 absolute bottom-1 right-1 justify-end">
          <div className="flex flex-col gap-1 ml-auto mr-0">
            {item.is_reserved ? (
              <Chip color="success" className="ml-auto mr-0">
                Забронировано
              </Chip>
            ) : null}
            {item.cost ? (
              <Chip className="ml-auto mr-0">
                {item.cost.toLocaleString() + " ₽"}
              </Chip>
            ) : null}
          </div>
        </CardFooter>
      </Card>
    );
  }
);

WishItemMenu.defaultProps = {
  canReserve: false,
  canCancelReserve: false,
  onReserve: () => {},
  onCancelReserve: () => {},
};
