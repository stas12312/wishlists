import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

import { WishlistCreateForm } from "./form";

import { IWishlist } from "@/lib/models/wishlist";

export default function WishlistSaveModal({
  isOpen,
  onOpenChange,
  onSaveWishlist,
  wishlist,
}: {
  isOpen: boolean;
  onOpenChange: { (): void };
  onSaveWishlist: { (wishlist: IWishlist): void };
  wishlist?: IWishlist | undefined;
}) {
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      placement="center"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              {wishlist ? "Редактирование вишлиста" : "Добавление вишлиста"}
            </ModalHeader>
            <ModalBody>
              <WishlistCreateForm
                wishlist={wishlist}
                onCreate={onSaveWishlist}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
