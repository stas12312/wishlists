import { Modal } from "@heroui/react";

import { WishlistCreateForm } from "./WishlistForm";

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog>
            <Modal.Header className="flex flex-col gap-1 text-center">
              {wishlist ? "Редактирование вишлиста" : "Добавление вишлиста"}
            </Modal.Header>
            <Modal.Body className="p-1">
              <WishlistCreateForm
                wishlist={wishlist}
                onCreate={onSaveWishlist}
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
