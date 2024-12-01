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
      isInvalid={errorMessage !== "" && errorMessage !== undefined}
      label={label}
      name={name}
      type={isVisible ? "text" : "password"}
      value={value}
      onChange={onChange}
    />
  );
}

PasswordInput.defaultProps = {
  errorMessage: "",
};
