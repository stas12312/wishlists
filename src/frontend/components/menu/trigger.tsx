import { Popover } from "@heroui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

const MenuTrigger = ({
  className = "",
  name = "",
}: {
  className?: string;
  name?: string;
}) => {
  return (
    <Popover.Trigger
      className={`button button--ghost ${className}`}
      data-qa={name}
    >
      <BsThreeDotsVertical />
    </Popover.Trigger>
  );
};

export default MenuTrigger;
