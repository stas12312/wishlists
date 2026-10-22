import { toast, useOverlayState } from "@heroui/react";
import { Key, useState } from "react";

import ConfirmationModal from "../ConfirmationModal";
import SelectWishlistModal from "../wishlist/WishlistSelectorModal";

import WishSaveModal from "./WishSaveModal";

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
import { IWish } from "@/lib/models/wish";
import { IWishlist } from "@/lib/models/wishlist";

export function useWishActions({
  wish,
  onDelete = () => {},
  onUpdate = () => {},
}: {
  wish: IWish;
  onDelete?: { (wish: IWish, message: string): void };
  onUpdate?: { (wish: IWish): void };
}) {
  const [isConfirm, setIsConfirm] = useState(false);
  const editModal = useOverlayState();
  const moveModal = useOverlayState();
  const copyModal = useOverlayState();

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
    toast("Желание скопировано", {
      description: `В вишлист "${wishlist.name}"`,
    });
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

  const modals = (
    <>
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

  return { handleOnAction, modals };
}
