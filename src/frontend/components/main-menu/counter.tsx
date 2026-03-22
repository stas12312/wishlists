import { Chip } from "@heroui/react";

export const Counter = ({ value }: { value: number }) => {
  return value ? (
    <Chip className="my-auto" color="accent" variant="primary">
      {value.toLocaleString()}
    </Chip>
  ) : (
    ""
  );
};
