import { Input } from "@nextui-org/input";
import {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";

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
  const inputsRefs: MutableRefObject<HTMLInputElement | null>[] = [];
  const currentIndex = value.length;
  const values: string[] = new Array<string>(digitsCount).fill("");

  useEffect(() => {
    if (values[0] == "") {
      inputsRefs[0].current?.focus();
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
    const input = inputsRefs[index + 1].current;
    if (input !== null) {
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
      inputsRefs[index - 1].current?.focus();
      values[index - 1] = "";
      values[index] = "";
    }
    onValueChange(values.join(""));
  }

  const inputs = [];
  for (let i = 0; i < digitsCount; i++) {
    inputsRefs.push(useRef(null));
    console.log(currentIndex);
    inputs.push(
      <span key={i}>
        <Input
          className="w-12"
          classNames={{
            inputWrapper: [
              "group-data-[focus=true]:bg-default-200 group-data-[focus=true]:scale-105",
            ],
            input: ["text-center"],
          }}
          type="number"
          size="lg"
          key={i}
          value={values[i]}
          isDisabled={disabled || i > currentIndex}
          name={i.toString()}
          onChange={processInput}
          onKeyUp={(e) => {
            e.key == "Backspace" ? deleteDigit(i) : null;
          }}
          ref={inputsRefs[i]}
        ></Input>
      </span>
    );
  }

  return <div className="flex gap-2 text p-2 justify-center">{inputs}</div>;
};

export default CodeInput;

