import { Chip } from "@heroui/chip";
import { AnimatePresence, motion } from "framer-motion";

import { IWish } from "@/lib/models/wish";
import { defaultVariants } from "@/lib/animations/default";

const WishlistStatus = ({
  wish,
  size = "md",
}: {
  wish: IWish;
  size?: "sm" | "md" | "lg";
}) => {
  return (
    <>
      <AnimatePresence>
        {wish.fulfilled_at ? (
          <motion.span
            key={wish.uuid}
            animate="animate"
            exit="exit"
            initial="initial"
            variants={defaultVariants}
          >
            <Chip color="primary" size={size}>
              Исполнено {wish.actions.cancel_reserve ? " вами" : null}
            </Chip>
          </motion.span>
        ) : null}
        {wish.is_reserved && !wish.fulfilled_at ? (
          <motion.span
            key={wish.uuid}
            animate="animate"
            exit="exit"
            initial="initial"
            variants={defaultVariants}
          >
            <Chip color="success" size="lg">
              Забронировано
              {wish.actions.cancel_reserve ? " вами" : null}
            </Chip>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default WishlistStatus;
