import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { MdFilterAlt } from "react-icons/md";
import { ReactNode } from "react";

const Filter = ({
  applyFilter,
  isShowBadge,
  children,
}: {
  applyFilter: { (): void };
  isShowBadge?: boolean;
  children: ReactNode;
}) => {
  const { isOpen, onOpenChange } = useDisclosure();

  return (
    <Popover
      showArrow
      isOpen={isOpen}
      offset={20}
      placement="bottom"
      onClose={() => {
        applyFilter;
      }}
      onOpenChange={onOpenChange}
    >
      <Badge color="primary" content="" isInvisible={!isShowBadge}>
        <PopoverTrigger>
          <Button isIconOnly variant="flat" onPress={onOpenChange}>
            <MdFilterAlt />
          </Button>
        </PopoverTrigger>
      </Badge>

      <PopoverContent className="p-2">
        <h3>Фильтры</h3>
        {children}
        <Button
          fullWidth
          color="primary"
          size="sm"
          onPress={() => {
            onOpenChange();
            applyFilter();
          }}
        >
          Применить
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default Filter;
