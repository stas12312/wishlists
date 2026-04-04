import {
  ErrorMessage,
  FieldError,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function PasswordInput({
  value,
  onChange,
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
  onBlur?: { (e: React.ChangeEvent<HTMLInputElement>): void };
  errorMessage?: string;
  label: string;
  name: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  validate?: { (value: any): string | null };
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      fullWidth
      isInvalid={isInvalid}
      isRequired={isRequired}
      name={name}
      type="password"
      validate={validate}
      variant="secondary"
    >
      <Label>{label}</Label>
      <InputGroup>
        <InputGroup.Input
          type={isVisible ? "text" : "password"}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
        />
        <InputGroup.Suffix>
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
        </InputGroup.Suffix>
      </InputGroup>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <FieldError />
    </TextField>
  );
}

PasswordInput.defaultProps = {
  errorMessage: "",
};
