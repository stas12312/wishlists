import { Chip } from "@heroui/chip";

export const Counter = ({ value }: { value: number }) => {
  return value ? (
    <Chip className="my-auto" color="primary" radius="sm" size="sm">
      {value.toLocaleString()}
    </Chip>
  ) : (
    ""
  );
};
