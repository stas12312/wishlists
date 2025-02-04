import { Input } from "@heroui/input";
import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function PasswordInput({
  value,
  onChange,
  onValueChange,
  onBlur,
  isInvalid,
  label,
  name,
  errorMessage,
  isRequired,
  validate,
}: {
  value?: string;
  onChange?: { (e: React.ChangeEvent<HTMLInputElement>): void };
  onValueChange?: { (value: string): void };
  onBlur?: { (e: React.ChangeEvent<HTMLInputElement>): void };
  errorMessage?: string;
  label: string;
  name: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  validate?: { (value: any): string | null };
}) {
  const [isVisible, setIsVisible] = useState(false);
  errorMessage;
  return (
    <Input
      fullWidth
      endContent={
        <button
          aria-label="toggle password visibility"
          className="focus:outline-none"
          type="button"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            <IoMdEyeOff className="text-2xl text-default-400 pointer-events-none" />
          ) : (
            <IoMdEye className="text-2xl text-default-400 pointer-events-none" />
          )}
        </button>
      }
      errorMessage={errorMessage}
      isInvalid={isInvalid}
      isRequired={isRequired}
      label={label}
      name={name}
      type={isVisible ? "text" : "password"}
      validate={validate}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      onValueChange={onValueChange}
    />
  );
}

PasswordInput.defaultProps = {
  errorMessage: "",
};
