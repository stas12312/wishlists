import { Modal, ModalHeader, ModalBody } from "@heroui/react";

import WishForm from "./WishForm";

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog className="max-w-200 w-full">
            <Modal.CloseTrigger />
            <ModalHeader className="flex flex-col gap-1 text-center">
              <Modal.Heading>
                {wish ? "Редактирование желания" : "Добавление желания"}
              </Modal.Heading>
            </ModalHeader>
            <ModalBody className="p-1">
              <WishForm
                wish={wish}
                wishlistUUID={wishlistUUID}
                onCreate={onUpdate}
              />
            </ModalBody>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
