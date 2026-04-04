import { Popover } from "@heroui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { twMerge } from "tailwind-merge";

const MenuTrigger = ({
  className = "",
  name = "",
}: {
  className?: string;
  name?: string;
}) => {
  return (
    <Popover.Trigger
      className={twMerge(
        "button bg-default/50 hover:bg-default/60 shadow-md",
        className,
      )}
      data-qa={name}
    >
      <BsThreeDotsVertical />
    </Popover.Trigger>
  );
};

export default MenuTrigger;
