import { Input } from "@nextui-org/input";
import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function PasswordInput({
  value,
  onChange,
  label,
  name,
  errorMessage,
}: {
  value: string;
  onChange: { (e: React.ChangeEvent<HTMLInputElement>): void };
  errorMessage: string;
  label: string;
  name: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Input
      fullWidth
      label={label}
      type={isVisible ? "text" : "password"}
      value={value}
      onChange={onChange}
      name={name}
      isInvalid={errorMessage !== "" && errorMessage !== undefined}
      errorMessage={errorMessage}
      endContent={
        <button
          className="focus:outline-none"
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          aria-label="toggle password visibility"
        >
          {isVisible ? (
            <IoMdEyeOff className="text-2xl text-default-400 pointer-events-none" />
          ) : (
            <IoMdEye className="text-2xl text-default-400 pointer-events-none" />
          )}
        </button>
      }
    />
  );
}

PasswordInput.defaultProps = {
  errorMessage: "",
};
