import { Modal } from "@heroui/react";

import { WishlistCreateForm } from "./WishlistForm";

import { IWishlist } from "@/lib/models/wishlist";

export default function WishlistSaveModal({
  isOpen,
  onOpenChange,
  onSaveWishlist,
  wishlist,
  className,
}: {
  isOpen: boolean;
  onOpenChange: { (): void };
  onSaveWishlist: { (wishlist: IWishlist): void };
  wishlist?: IWishlist | undefined;
  className?: string;
}) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement="center">
        <Modal.Dialog
          className={`flex max-h-[calc(100dvh-2rem)] w-full max-w-160 flex-col overflow-hidden px-2 md:px-4 ${className ?? ""}`}
        >
          <Modal.Header className="flex flex-col gap-1 text-center">
            <Modal.Heading>
              {wishlist ? "Редактирование вишлиста" : "Добавление вишлиста"}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="min-h-0 overflow-y-auto p-1">
            <WishlistCreateForm wishlist={wishlist} onCreate={onSaveWishlist} />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
