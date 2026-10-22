import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Kbd,
  TextField,
  Tooltip,
} from "@heroui/react";
import { ReactNode, useRef, useState } from "react";
import { MdSend } from "react-icons/md";
import { twMerge } from "tailwind-merge";

export const MessageForm = ({
  minLength = 1,
  maxLength = 1000,
  rows = 3,
  footer,
  placeholder = "Введите сообщение",
  onSend,
  value,
  onValueChange,
  allowEmpty = false,
  isSendDisabled = false,
  isCompact = false,
}: {
  minLength?: number;
  maxLength?: number;
  rows?: number;
  footer?: ReactNode;
  placeholder?: string;
  onSend: { (message: string): void };
  value?: string;
  onValueChange?: { (message: string): void };
  allowEmpty?: boolean;
  isSendDisabled?: boolean;
  isCompact?: boolean;
}) => {
  const [innerMessage, setInnerMessage] = useState("");
  const message = value ?? innerMessage;
  const setMessage = onValueChange ?? setInnerMessage;
  const submitRef = useRef<HTMLButtonElement>(null);
  return (
    <Form
      className="mt-auto"
      onSubmit={(e) => {
        e.preventDefault();
        if (isSendDisabled) {
          return;
        }
        onSend(message);
        setMessage("");
      }}
    >
      <TextField
        fullWidth
        aria-label="Сообщение"
        isRequired={!allowEmpty}
        value={message}
        variant="secondary"
        onChange={(value) => setMessage(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            submitRef.current?.click();
          }
        }}
      >
        <InputGroup
          className={twMerge(
            "flex flex-col shadow-md rounded-3xl",
            isCompact && "flex-row items-end",
          )}
        >
          <InputGroup.TextArea
            className={twMerge(
              "w-full  resize-none",
              isCompact && "field-sizing-content max-h-40 min-h-12 py-3 pl-4",
            )}
            maxLength={maxLength}
            minLength={allowEmpty ? 0 : minLength}
            placeholder={placeholder}
            rows={rows}
          />
          <InputGroup.Suffix
            className={twMerge(
              "flex w-full py-2",
              isCompact && "w-auto self-end py-1.5 pl-0 pr-1.5",
            )}
          >
            <p
              className={twMerge(
                "mt-auto",
                isCompact && "hidden",
                message.length >= maxLength ||
                  (!allowEmpty && message.length < minLength)
                  ? "text-danger"
                  : undefined,
                !message.length ? "invisible" : "visible",
              )}
            >
              {message.length} / {maxLength} символов
            </p>
            <div className="ml-auto flex gap-2 h-9">
              {footer}
              {message.length > 0 || allowEmpty ? (
                <Tooltip closeDelay={0} delay={0}>
                  <Button
                    ref={submitRef}
                    isIconOnly
                    className="w-12"
                    isDisabled={isSendDisabled}
                    type="submit"
                    variant="primary"
                  >
                    <MdSend />
                  </Button>

                  <Tooltip.Content className="flex text-sm p-2 gap-1.5 min-w-36 mr-2">
                    <p>Отправить</p>
                    <Kbd>
                      <Kbd.Abbr keyValue="ctrl" />
                      <Kbd.Abbr keyValue="enter" />
                    </Kbd>
                  </Tooltip.Content>
                </Tooltip>
              ) : null}
            </div>
          </InputGroup.Suffix>
        </InputGroup>
        <FieldError />
      </TextField>
    </Form>
  );
};
