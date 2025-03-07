"use client";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useDisclosure } from "@heroui/modal";
import { observer } from "mobx-react-lite";
import { Key, useState } from "react";
import { addToast } from "@heroui/toast";

import ConfirmationModal from "../confirmation";
import SelectWishlistModal from "../wishlist/selectModal";

import { WishItemMenu } from "./cardMenu";
import WishFullCard from "./fullCard";
import CardImage from "./cardImage";
import WishSaveModal from "./saveModal";

import { IWish, IWishActions } from "@/lib/models/wish";
import { getWish } from "@/lib/requests";
import { cancelWishFull, moveWish } from "@/lib/requests/wish";
import { makeWishFull } from "@/lib/requests/wish";
import { cancelReserveWish } from "@/lib/requests/wish";
import { reserveWish } from "@/lib/requests/wish";
import { deleteWish } from "@/lib/requests/wish";

export const WishItem = observer(
  ({
    wish,
    onDelete,
    withUser = false,
  }: {
    wish: IWish;
    onDelete: { (wish: IWish, message: string): void };
    withUser?: boolean;
  }) => {
    const [item, setItem] = useState<IWish>(wish);
    const [isConfirm, setIsConfirm] = useState(false);
    const editModal = useDisclosure();
    const moveModal = useDisclosure();
    const fullCardDrawer = useDisclosure();

    async function onDeleteWish() {
      await onDelete(wish, "Желание удалено");
      await deleteWish(wish.uuid ?? "");
      setIsConfirm(false);
    }

    async function onWishUpdate(wish: IWish) {
      editModal.onOpenChange();
      setItem(wish);
    }

    async function onMove(wishlistUUID: string) {
      await moveWish(wish.uuid || "", wishlistUUID);
      moveModal.onClose();
      await onDelete(wish, "Желание перенесено");
    }

    async function handleOnAction(key: Key | string) {
      const wishUUID = wish.uuid ?? "";

      if (key === "delete" && wish.uuid) {
        setIsConfirm(true);
      }
      if (key === "edit") {
        editModal.onOpen();
      }
      if (key === "reserve") {
        const result = await reserveWish(wishUUID);
        if (result) {
          addToast({
            title: result.message,
            color: "danger",
          });
        } else {
          setItem(await getWish(wishUUID));
          addToast({
            title: "Желание забронировано",
          });
        }
      }
      if (key === "cancel_reserve") {
        const result = await cancelReserveWish(wishUUID);
        if (result) {
          addToast({
            title: result.message,
            color: "danger",
          });
        } else {
          setItem(await getWish(wishUUID));
          addToast({
            title: "Бронь отменена",
          });
        }
      }
      if (key === "make_full") {
        await makeWishFull(wishUUID);
        setItem(await getWish(wishUUID));
      }
      if (key === "cancel_full") {
        await cancelWishFull(wishUUID);
        setItem(await getWish(wishUUID));
      }
      if (key === "open_wishlist") {
        window.open(`/wishlists/${wish.wishlist_uuid}`);
      }
      if (key === "move") {
        moveModal.onOpen();
      }
    }

    return (
      <>
        <div className="md:hover:scale-[1.03] duration-200">
          <Card
            className={`flex-col ${withUser ? "h-[340px]" : "h-[300px]"} w-full`}
            isPressable={true}
            onPress={() => {
              fullCardDrawer.onOpen();
            }}
          >
            <CardHeader className="flex-col items-start">
              <div className="flex flex-row justify-between w-full h-[40px]">
                <p className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden text-ellipsis truncate">
                  <span className="text-xl" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-default-500" title={item.comment}>
                    {item.comment}
                  </span>
                </p>
                {showMenu(wish.actions) ? (
                  <span>
                    <WishItemMenu handeAction={handleOnAction} wish={item} />
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardBody>
              <CardImage
                removeWrapper
                className="h-full"
                iconClassName="h-full"
                wish={item}
              />
            </CardBody>
            {withUser ? (
              <CardFooter className="flex justify-between">
                <Chip avatar={<Avatar src={item.user.image} />}>
                  {item.user.name}
                </Chip>

                {item.wishlist.date ? (
                  <Chip color="warning">
                    {new Date(item.wishlist.date).toLocaleDateString()}
                  </Chip>
                ) : null}
              </CardFooter>
            ) : null}
          </Card>
        </div>
        <WishFullCard
          handeAction={handleOnAction}
          isOpen={fullCardDrawer.isOpen}
          wish={item}
          withUser={withUser}
          onOpenChange={fullCardDrawer.onOpenChange}
        />
        <ConfirmationModal
          isOpen={isConfirm}
          message="Вы действительно хотите удалить желание?"
          onConfirm={onDeleteWish}
          onDecline={() => {
            setIsConfirm(false);
          }}
        />
        <WishSaveModal
          isOpen={editModal.isOpen}
          wish={item}
          wishlistUUID={wish.wishlist_uuid}
          onOpenChange={editModal.onOpenChange}
          onUpdate={onWishUpdate}
        />
        <SelectWishlistModal
          excludeWishlists={[wish.wishlist_uuid]}
          isOpen={moveModal.isOpen}
          onOpenChange={moveModal.onOpenChange}
          onSelect={onMove}
        />
      </>
    );
  },
);

function showMenu(actions: IWishActions): boolean {
  return actions.edit || actions.cancel_reserve || actions.reserve;
}
