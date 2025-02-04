import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

import WishForm from "./form";

import { IWish } from "@/lib/models/wish";

export default function WishSaveModal({
  isOpen,
  onOpenChange,
  wishlistUUID,
  onUpdate,
  wish,
}: {
  isOpen: boolean;
  onOpenChange: { (): void };
  wishlistUUID: string;
  onUpdate: { (wish: IWish): void };
  wish?: IWish | undefined;
}) {
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      placement="top-center"
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              {wish ? "Редактирование желания" : "Добавление желания"}
            </ModalHeader>
            <ModalBody>
              <WishForm
                wish={wish}
                wishlistUUID={wishlistUUID}
                onCreate={onUpdate}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
