import { Badge, Button, Popover, useOverlayState } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { MdFilterAlt } from "react-icons/md";

import { defaultVariants } from "@/lib/animations/default";

const Filter = ({
  applyFilter,
  isShowBadge,
  children,
}: {
  applyFilter: { (): void };
  isShowBadge?: boolean;
  children: ReactNode;
}) => {
  const filterOverlay = useOverlayState();

  return (
    <Popover
      isOpen={filterOverlay.isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen === false) {
          applyFilter();
        }
        filterOverlay.setOpen(isOpen);
      }}
    >
      <Popover.Trigger>
        <motion.span
          animate="animate"
          initial="initial"
          variants={defaultVariants}
        >
          <Badge.Anchor>
            <Button
              isIconOnly
              data-qa="select-filters"
              variant="tertiary"
              onPress={filterOverlay.toggle}
            >
              <MdFilterAlt />
            </Button>
            {isShowBadge ? <Badge color="accent" size="sm" /> : null}
          </Badge.Anchor>
        </motion.span>
      </Popover.Trigger>
      <Popover.Content offset={20} placement="bottom left">
        <Popover.Dialog className="flex flex-col gap-3 py-2">
          <Popover.Arrow className="custom-arrow" />
          <Popover.Heading className="text-center">Фильтры</Popover.Heading>
          {children}
          <Button
            fullWidth
            size="sm"
            onPress={() => {
              applyFilter();
              filterOverlay.close();
            }}
          >
            Применить
          </Button>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
};

export default Filter;
