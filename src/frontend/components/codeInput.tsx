import { Input } from "@nextui-org/input";
import { ChangeEvent, useEffect, useRef } from "react";

const CodeInput = ({
  digitsCount,
  value,
  onValueChange,
  disabled,
}: {
  digitsCount: number;
  value: string;
  onValueChange: { (value: string): void };
  disabled: boolean;
}) => {
  const inputsRefs = useRef<Array<HTMLInputElement | null>>([]);
  const currentIndex = value.length;
  const values: string[] = new Array<string>(digitsCount).fill("");

  useEffect(() => {
    if (values[0] == "" && inputsRefs.current[0]) {
      inputsRefs.current[0].focus();
    }
  }, [values]);

  for (let i = 0; i < value.length; i++) {
    values[i] = value[i];
  }

  function processInput(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const inputValue = e.target.value;

    const oneDigit = inputValue[inputValue.length - 1];
    if (inputValue.length == digitsCount) {
      onValueChange(inputValue);
      return;
    }

    const index = parseInt(name);

    values[index] = oneDigit;
    onValueChange(values.join(""));
    if (index == digitsCount - 1) {
      return;
    }
    const input = inputsRefs.current[index + 1];
    if (input) {
      input.disabled = false;
      input.focus();
    }
  }

  function deleteDigit(index: number) {
    if (currentIndex == 0) {
      return;
    }
    if (values[index] != "") {
      values[index] = "";
    } else {
      const currentInput = inputsRefs.current[index - 1];
      if (currentInput) {
        currentInput.focus();
        values[index - 1] = "";
        values[index] = "";
      }
    }
    onValueChange(values.join(""));
  }

  const inputs = [];
  for (let i = 0; i < digitsCount; i++) {
    inputs.push(
      <span key={i}>
        <Input
          key={i}
          ref={(ref) => {
            inputsRefs.current[i] = ref;
          }}
          className="w-12"
          classNames={{
            inputWrapper: [
              "group-data-[focus=true]:bg-default-200 group-data-[focus=true]:scale-105",
            ],
            input: ["text-center"],
          }}
          isDisabled={disabled || i > currentIndex}
          name={i.toString()}
          size="lg"
          type="number"
          value={values[i]}
          onChange={processInput}
          onKeyUp={(e) => {
            e.key == "Backspace" ? deleteDigit(i) : null;
          }}
        />
      </span>,
    );
  }

  return <div className="flex gap-2 text p-2 justify-center">{inputs}</div>;
};

export default CodeInput;
