import { IWishlist } from "@/lib/models";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import { WishlistCreateForm } from "./form";

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
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Добавление вишлиста
            </ModalHeader>
            <ModalBody>
              <WishlistCreateForm
                onCreate={onSaveWishlist}
                wishlist={wishlist}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
