import { Button } from "@heroui/button";
import { DropdownTrigger } from "@heroui/dropdown";
import { BsThreeDotsVertical } from "react-icons/bs";

const MenuTrigger = ({
  className = "",
  name = "",
}: {
  className?: string;
  name?: string;
}) => {
  return (
    <DropdownTrigger data-qa={name}>
      <Button
        isIconOnly
        as="div"
        className={className}
        radius="lg"
        variant="light"
      >
        <BsThreeDotsVertical />
      </Button>
    </DropdownTrigger>
  );
};

export default MenuTrigger;
