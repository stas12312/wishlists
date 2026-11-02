import { Modal, ModalHeader, ModalBody } from "@heroui/react";

import WishForm from "./WishForm";

import { IWish } from "@/lib/models/wish";

export default function WishSaveModal({
  isOpen,
  onOpenChange,
  wishlistUUID,
  onUpdate,
  wish,
  className,
}: {
  isOpen: boolean;
  onOpenChange: { (): void };
  wishlistUUID: string;
  onUpdate: { (wish: IWish): void };
  wish?: IWish | undefined;
  className?: string;
}) {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      variant="opaque"
      onOpenChange={onOpenChange}
    >
      <Modal.Container placement="center">
        <Modal.Dialog
          className={`max-w-200 w-full px-2 md:px-4 ${className ?? ""}`}
        >
          <Modal.CloseTrigger />
          <ModalHeader className="flex flex-col gap-1 text-center">
            <Modal.Heading>
              {wish ? "Редактирование желания" : "Добавление желания"}
            </Modal.Heading>
          </ModalHeader>
          <ModalBody className="p-1">
            <WishForm
              className={className}
              wish={wish}
              wishlistUUID={wishlistUUID}
              onCreate={onUpdate}
            />
          </ModalBody>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
