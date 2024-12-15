import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { useState } from "react";

const ConfirmationModal = ({
  onConfirm,
  onDecline,
  isOpen,
  message,
  confirmName = "Да",
  declineName = "Нет",
}: {
  onConfirm: { (): void };
  onDecline: { (): void };
  message: string;
  confirmName: string;
  declineName: string;
  isOpen: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onDecline}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Подтвердите действие
              </ModalHeader>
              <ModalBody>{message}</ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => {
                    onDecline();
                  }}
                >
                  {declineName}
                </Button>
                <Button
                  isLoading={isLoading}
                  color="danger"
                  onPress={() => {
                    setIsLoading(true);
                    onConfirm();
                  }}
                >
                  {confirmName}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

ConfirmationModal.defaultProps = {
  confirmName: "Да",
  declineName: "Нет",
};
export default ConfirmationModal;

