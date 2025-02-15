import { Key } from "react";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/modal";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdCreate, MdLink, MdRestoreFromTrash, MdDelete } from "react-icons/md";

import ConfirmationModal from "../confirmation";

import WishlistSaveModal from "./saveModal";

import { restoreWishlist } from "@/lib/requests";
import { IWishlist } from "@/lib/models/wishlist";

export const WishlistItemMenu = ({
  wishlist,
  onDelete,
  onUpdate,
  onRestore,
  className,
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
      toast.success("Ссылка на вишлист скопирована");
    }
    if (key === "restore") {
      await restoreWishlist(wishlist.uuid);
      onRestore(wishlist);
      toast.success("Вишлист восстановлен");
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
    <span data-qa="wishlist-menu">
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
    </span>
  );
};

export default WishlistItemMenu;
