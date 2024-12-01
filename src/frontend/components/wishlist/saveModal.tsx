import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";

import { WishlistCreateForm } from "./form";

import { IWishlist } from "@/lib/models";

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
      placement="top-center"
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
