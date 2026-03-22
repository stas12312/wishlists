"use client";
import { Card, Chip, toast, useOverlayState } from "@heroui/react";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { Key, useState } from "react";

import ConfirmationModal from "../confirmation";
import { UserChip } from "../user";
import SelectWishlistModal from "../wishlist/selectModal";

import CardImage from "./cardImage";
import { WishItemMenu } from "./cardMenu";
import WishFullCard from "./fullCard";
import WishSaveModal from "./saveModal";

import {
  cancelReserveWish,
  cancelWishFull,
  copyWish,
  deleteWish,
  getWish,
  makeWishFull,
  moveWish,
  reserveWish,
} from "@/lib/client-requests/wish";
import { IWish, IWishActions } from "@/lib/models/wish";
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
    const editModal = useOverlayState();
    const moveModal = useOverlayState();
    const copyModal = useOverlayState();
    const fullCardDrawer = useOverlayState();

    async function onDeleteWish() {
      await onDelete(wish, "Желание удалено");
      await deleteWish(wish.uuid ?? "");
      setIsConfirm(false);
    }

    async function onWishUpdate(wish: IWish) {
      editModal.toggle();
      onUpdate(wish);
    }

    async function onMove(wishlist: IWishlist) {
      await moveWish(wish.uuid || "", wishlist.uuid);
      moveModal.close();
      await onDelete(wish, `Желание перенесено в вишлист "${wishlist.name}"`);
    }

    async function onCopy(wishlist: IWishlist) {
      await copyWish(wish.uuid || "", wishlist.uuid);
      copyModal.close();
      toast("Желание скопировано");
      // addToast({
      //   title: "Желание скопировано",
      //   description: `В вишлист "${wishlist.name}"`,
      // });
    }

    async function handleOnAction(key: Key | string) {
      const wishUUID = wish.uuid ?? "";

      if (key === "delete" && wish.uuid) {
        setIsConfirm(true);
      }
      if (key === "edit") {
        editModal.open();
      }
      if (key === "reserve") {
        const result = await reserveWish(wishUUID);
        if (result) {
          toast.danger(result.message);
        } else {
          onUpdate(await getWish(wishUUID));
          toast("Желание забронировано");
        }
      }
      if (key === "cancel_reserve") {
        const result = await cancelReserveWish(wishUUID);
        if (result) {
          toast.danger(result.message);
        } else {
          onUpdate(await getWish(wishUUID));
          toast("Бронь отменена");
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
        moveModal.open();
      }
      if (key === "copy") {
        copyModal.open();
      }
    }

    return (
      <>
        <div className="md:hover:scale-[1.03] duration-200 relative">
          <Card
            className={`flex-col ${withUser ? "h-80" : "h-70"} w-full ring-1 ring-gray-500/30 cursor-pointer p-0`}
          >
            <button
              className="cursor-pointer card h-full p-0 gap-0"
              onClick={() => {
                fullCardDrawer.open();
              }}
            >
              {wish.images && wish.images[0] ? (
                <Image
                  unoptimized
                  alt="Изображение желания"
                  className="object-cover bottom-[50%] z-0 blur-xl absolute rounded-large"
                  fill={true}
                  src={wish.images[0]}
                />
              ) : null}

              <div className="bg-default/50 absolute z-0 inset-0 roundend-large backdrop-saturate-200 backdrop-contrast-125" />

              <Card.Header className="flex-col items-start p-0 z-10">
                <div className="flex flex-row justify-between w-full h-14 px-2">
                  <p className="font-bold my-auto flex flex-col text-left overflow-hidden text-ellipsis truncate">
                    <span className="text-xl" title={wish.name}>
                      {wish.name}
                    </span>
                    <span className="text-gray text-sm" title={wish.comment}>
                      {wish.comment}
                    </span>
                  </p>
                  {showMenu(wish.actions) ? (
                    <span className="flex items-center">
                      <WishItemMenu handeAction={handleOnAction} wish={wish} />
                    </span>
                  ) : null}
                </div>
              </Card.Header>
              <Card.Content className="p-0 h-full object-cover">
                <CardImage
                  removeWrapper
                  className="h-full"
                  iconClassName="h-full"
                  wish={wish}
                />
              </Card.Content>
              {withUser ? (
                <Card.Footer className="flex justify-between">
                  <UserChip user={wish.user} />
                  {wish.wishlist.date ? (
                    <Chip color="warning">
                      {new Date(wish.wishlist.date).toLocaleDateString()}
                    </Chip>
                  ) : null}
                </Card.Footer>
              ) : null}
            </button>
          </Card>
        </div>
        <WishFullCard
          handeAction={handleOnAction}
          isOpen={fullCardDrawer.isOpen}
          wish={wish}
          withUser={withUser}
          onOpenChange={fullCardDrawer.toggle}
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
          onOpenChange={editModal.toggle}
          onUpdate={onWishUpdate}
        />
        <SelectWishlistModal
          excludeWishlists={[wish.wishlist_uuid]}
          isOpen={moveModal.isOpen}
          onOpenChange={moveModal.toggle}
          onSelect={onMove}
        />
        <SelectWishlistModal
          excludeWishlists={[]}
          isOpen={copyModal.isOpen}
          onOpenChange={copyModal.toggle}
          onSelect={onCopy}
        />
      </>
    );
  },
);

function showMenu(actions: IWishActions): boolean {
  return actions.edit || actions.cancel_reserve || actions.reserve;
}
