import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ButtonWithLoader } from "./button-with-loader";

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
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (isOpen && e.key === "Enter") {
        const activeElement = document.activeElement;
        if (
          !activeElement ||
          (activeElement.tagName !== "BUTTON" &&
            activeElement.tagName !== "INPUT" &&
            activeElement.tagName !== "TEXTAREA")
        ) {
          buttonRef.current?.click();
        }
      }
    };

    const keydownHandler = (e: KeyboardEvent): void => handleKeyDown(e);
    document.addEventListener("keydown", keydownHandler as EventListener);

    return () => {
      document.removeEventListener("keydown", keydownHandler as EventListener);
    };
  }, [isOpen]);

  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal isOpen={isOpen} onOpenChange={onDecline}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header className="flex flex-col gap-1 text-center">
              <Modal.Heading> {title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-1">
              <div className="flex flex-col gap-2">
                {message}
                {confirmByText ? (
                  <TextField
                    value={text}
                    variant="secondary"
                    onChange={(value) => {
                      setText(value);
                    }}
                  >
                    <Label>{confirmLabel}</Label>
                    <Input />
                    <FieldError />
                  </TextField>
                ) : null}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                value="primary"
                onPress={() => {
                  onDecline();
                }}
              >
                {declineName}
              </Button>
              <ButtonWithLoader
                ref={buttonRef}
                isDisabled={confirmByText && !(confirmText == text)}
                isLoading={isLoading}
                variant="danger-soft"
                onPress={async () => {
                  setIsLoading(true);
                  await onConfirm();
                  setIsLoading(false);
                }}
              >
                {confirmName}
              </ButtonWithLoader>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ConfirmationModal;
