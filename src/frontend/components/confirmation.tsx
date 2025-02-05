import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { ReactNode, useEffect, useState } from "react";

const ConfirmationModal = ({
  onConfirm,
  onDecline,
  isOpen,
  message,
  confirmName = "Да",
  declineName = "Нет",
  title = "Подтвердите действие",
  confirmByText = false,
  confirmText,
  confirmLabel,
}: {
  onConfirm: { (): void };
  onDecline: { (): void };
  message: string | ReactNode;
  confirmName?: string;
  declineName?: string;
  isOpen: boolean;
  title?: string;
  confirmByText?: boolean;
  confirmText?: string;
  confirmLabel?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    setText("");
  }, [isOpen]);

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onDecline}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                {title}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-2">
                  {message}
                  {confirmByText ? (
                    <Input
                      label={confirmLabel}
                      value={text}
                      onValueChange={setText}
                    />
                  ) : null}
                </div>
              </ModalBody>
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
                  color="danger"
                  isDisabled={confirmByText && !(confirmText == text)}
                  isLoading={isLoading}
                  onPress={async () => {
                    setIsLoading(true);
                    await onConfirm();
                    setIsLoading(false);
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

export default ConfirmationModal;
