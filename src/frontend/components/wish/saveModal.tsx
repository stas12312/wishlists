import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import WishForm from "./form";
import { IWish } from "@/lib/models";

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
      size="3xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              {wish ? "Редактирование желания" : "Добавление желания"}
            </ModalHeader>
            <ModalBody>
              <WishForm
                onCreate={onUpdate}
                wishlistUUID={wishlistUUID}
                wish={wish}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
