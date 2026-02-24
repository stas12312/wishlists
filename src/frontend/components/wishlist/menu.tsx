import { Key } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/modal";
import { useState } from "react";
import { MdCreate, MdLink, MdRestoreFromTrash, MdDelete } from "react-icons/md";
import { addToast } from "@heroui/toast";

import ConfirmationModal from "../confirmation";
import MenuTrigger from "../menu/trigger";

import WishlistSaveModal from "./saveModal";

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
      addToast({
        title: "Ссылка на вишлист скопирована",
      });
    }
    if (key === "restore") {
      await restoreWishlist(wishlist.uuid);
      onRestore(wishlist);
      addToast({
        title: "Вишлист восстановлен",
      });
    }
  }

  async function deleteWishlistByAction() {
    await onDelete(wishlist);
    setIsConfirm(false);
  }

  function onUpdateWishlist(updadedWishlist: IWishlist): void {
    onOpenChange();
    onUpdate(updadedWishlist);
  }

  return (
    <>
      <Dropdown>
        <MenuTrigger className={className} name="wishlist-menu" />
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
                      Поделиться
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
              Поделиться
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
    </>
  );
};

export default WishlistItemMenu;
