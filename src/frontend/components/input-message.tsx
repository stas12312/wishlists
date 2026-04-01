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
  footer,
  onSend,
}: {
  minLength?: number;
  maxLength?: number;
  footer?: ReactNode;
  onSend: { (message: string): void };
}) => {
  const [message, setMessage] = useState("");
  const submitRef = useRef<HTMLButtonElement>(null);
  return (
    <Form
      className="mt-auto"
      onSubmit={(e) => {
        e.preventDefault();
        onSend(message);
        setMessage("");
      }}
    >
      <TextField
        fullWidth
        isRequired
        value={message}
        variant="secondary"
        onChange={(value) => setMessage(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            submitRef.current?.click();
          }
        }}
      >
        <InputGroup className="flex flex-col  shadow-md rounded-3xl">
          <InputGroup.TextArea
            className="w-full  resize-none"
            maxLength={maxLength}
            minLength={minLength}
            placeholder="Ваше сообщение"
            rows={3}
          />
          <InputGroup.Suffix className="flex w-full py-2">
            <p
              className={twMerge(
                "mt-auto",
                message.length >= maxLength || message.length < minLength
                  ? "text-danger"
                  : undefined,
                !message.length ? "invisible" : "visible",
              )}
            >
              {message.length} / {maxLength} символов
            </p>
            <div className="ml-auto flex gap-2">
              {footer}
              <Tooltip closeDelay={0} delay={0}>
                <Button
                  ref={submitRef}
                  isIconOnly
                  className="w-12"
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
            </div>
          </InputGroup.Suffix>
        </InputGroup>
        <FieldError />
      </TextField>
    </Form>
  );
};
