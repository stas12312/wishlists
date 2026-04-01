import { Chip } from "@heroui/react";

export const Counter = ({ value }: { value: number }) => {
  return value ? (
    <Chip
      className="my-auto font-mono font-bold"
      color="accent"
      variant="primary"
    >
      1
    </Chip>
  ) : (
    ""
  );
};
