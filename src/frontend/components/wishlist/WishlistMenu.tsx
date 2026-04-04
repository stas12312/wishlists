import { Key } from "react";
import { useState } from "react";
import { MdCreate, MdLink, MdRestoreFromTrash, MdDelete } from "react-icons/md";
import {
  Dropdown,
  Label,
  Separator,
  toast,
  useOverlayState,
} from "@heroui/react";

import ConfirmationModal from "../ConfirmationModal";
import MenuTrigger from "../menu/MenuTrigger";

import WishlistSaveModal from "./WishlistSaveModal";

import { restoreWishlist } from "@/lib/client-requests/wishlist";
import { IWishlist } from "@/lib/models/wishlist";

export const WishlistItemMenu = ({
  wishlist,
  onDelete,
  onUpdate,
  onRestore,
  className = "",
  isEditable,
}: {
  wishlist: IWishlist;
  onDelete: { (wishlist: IWishlist): Promise<void> };
  onUpdate: { (wishlist: IWishlist): void };
  onRestore: { (wishlist: IWishlist): void };
  className?: string;
  isEditable: boolean;
}) => {
  const { isOpen, toggle } = useOverlayState();
  const [isConfirm, setIsConfirm] = useState(false);

  async function handleOnAction(key: Key) {
    if (key === "delete") {
      setIsConfirm(true);
    }
    if (key === "edit") {
      toggle();
    }
    if (key === "share") {
      navigator.clipboard.writeText(
        `${window.location.origin}/wishlists/${wishlist.uuid}`,
      );
      toast.success("Ссылка на вишлист скопирована");
    }
    if (key === "restore") {
      await restoreWishlist(wishlist.uuid);
      onRestore(wishlist);
      toast("Вишлист восстановлен");
    }
  }

  async function deleteWishlistByAction() {
    await onDelete(wishlist);
    setIsConfirm(false);
  }

  function onUpdateWishlist(updadedWishlist: IWishlist): void {
    toggle();
    onUpdate(updadedWishlist);
  }

  return (
    <>
      <Dropdown>
        <MenuTrigger className={className} name="wishlist-menu" />
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Static Actions" onAction={handleOnAction}>
            {isEditable ? (
              <>
                <Dropdown.Section>
                  {wishlist.is_active ? (
                    <>
                      <Dropdown.Item id="edit">
                        <MdCreate />
                        <Label>Редактировать</Label>
                      </Dropdown.Item>

                      <Dropdown.Item id="share">
                        <MdLink />
                        <Label>Поделиться</Label>
                      </Dropdown.Item>
                    </>
                  ) : (
                    <Dropdown.Item className="text-primary" id="restore">
                      <MdRestoreFromTrash />
                      <Label>Восстановить</Label>
                    </Dropdown.Item>
                  )}
                </Dropdown.Section>
                <Separator />

                <Dropdown.Item className="text-danger" id="delete">
                  <MdDelete />
                  {wishlist.is_active ? "Архивировать" : "Удалить"}
                </Dropdown.Item>
              </>
            ) : (
              <Dropdown.Item id="share">
                <MdLink />
                <Label>Поделиться</Label>
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <WishlistSaveModal
        isOpen={isOpen}
        wishlist={wishlist}
        onOpenChange={toggle}
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
    </>
  );
};

export default WishlistItemMenu;
