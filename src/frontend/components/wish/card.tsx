"use client";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useDisclosure } from "@heroui/modal";
import { observer } from "mobx-react-lite";
import { Key, useState } from "react";
import { addToast } from "@heroui/toast";

import ConfirmationModal from "../confirmation";
import SelectWishlistModal from "../wishlist/selectModal";
import { UserChip } from "../user";

import { WishItemMenu } from "./cardMenu";
import WishFullCard from "./fullCard";
import CardImage from "./cardImage";
import WishSaveModal from "./saveModal";

import { IWish, IWishActions } from "@/lib/models/wish";
import { copyWish, getWish } from "@/lib/client-requests/wish";
import { cancelWishFull, moveWish } from "@/lib/client-requests/wish";
import { makeWishFull } from "@/lib/client-requests/wish";
import { cancelReserveWish } from "@/lib/client-requests/wish";
import { reserveWish } from "@/lib/client-requests/wish";
import { deleteWish } from "@/lib/client-requests/wish";
import { IWishlist } from "@/lib/models/wishlist";

export const WishItem = observer(
  ({
    wish,
    onDelete = () => {},
    onUpdate = () => {},
    withUser = false,
  }: {
    wish: IWish;
    onDelete?: { (wish: IWish, message: string): void };
    onUpdate?: { (wish: IWish): void };
    withUser?: boolean;
  }) => {
    const [isConfirm, setIsConfirm] = useState(false);
    const editModal = useDisclosure();
    const moveModal = useDisclosure();
    const copyModal = useDisclosure();
    const fullCardDrawer = useDisclosure();

    async function onDeleteWish() {
      await onDelete(wish, "Желание удалено");
      await deleteWish(wish.uuid ?? "");
      setIsConfirm(false);
    }

    async function onWishUpdate(wish: IWish) {
      editModal.onOpenChange();
      onUpdate(wish);
    }

    async function onMove(wishlist: IWishlist) {
      await moveWish(wish.uuid || "", wishlist.uuid);
      moveModal.onClose();
      await onDelete(wish, `Желание перенесено в вишлист "${wishlist.name}"`);
    }

    async function onCopy(wishlist: IWishlist) {
      await copyWish(wish.uuid || "", wishlist.uuid);
      copyModal.onClose();
      addToast({
        title: "Желание скопировано",
        description: `В вишлист "${wishlist.name}"`,
      });
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
          onUpdate(await getWish(wishUUID));
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
          onUpdate(await getWish(wishUUID));
          addToast({
            title: "Бронь отменена",
          });
        }
      }
      if (key === "make_full") {
        await makeWishFull(wishUUID);
        onUpdate(await getWish(wishUUID));
      }
      if (key === "cancel_full") {
        await cancelWishFull(wishUUID);
        onUpdate(await getWish(wishUUID));
      }
      if (key === "open_wishlist") {
        window.open(`/wishlists/${wish.wishlist_uuid}`);
      }
      if (key === "move") {
        moveModal.onOpen();
      }
      if (key === "copy") {
        copyModal.onOpen();
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
                  <span className="text-xl" title={wish.name}>
                    {wish.name}
                  </span>
                  <span className="text-default-500" title={wish.comment}>
                    {wish.comment}
                  </span>
                </p>
                {showMenu(wish.actions) ? (
                  <span>
                    <WishItemMenu handeAction={handleOnAction} wish={wish} />
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardBody>
              <CardImage
                removeWrapper
                className="h-full"
                iconClassName="h-full"
                wish={wish}
              />
            </CardBody>
            {withUser ? (
              <CardFooter className="flex justify-between">
                <UserChip user={wish.user} />
                {wish.wishlist.date ? (
                  <Chip color="warning">
                    {new Date(wish.wishlist.date).toLocaleDateString()}
                  </Chip>
                ) : null}
              </CardFooter>
            ) : null}
          </Card>
        </div>
        <WishFullCard
          handeAction={handleOnAction}
          isOpen={fullCardDrawer.isOpen}
          wish={wish}
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
          wish={wish}
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
        <SelectWishlistModal
          excludeWishlists={[]}
          isOpen={copyModal.isOpen}
          onOpenChange={copyModal.onOpenChange}
          onSelect={onCopy}
        />
      </>
    );
  },
);

function showMenu(actions: IWishActions): boolean {
  return actions.edit || actions.cancel_reserve || actions.reserve;
}
