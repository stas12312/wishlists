import { Chip } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";

import { IWish } from "@/lib/models/wish";
import { defaultVariants } from "@/lib/animations/default";

const WishlistStatus = ({
  wish,
  size = "md",
}: {
  wish: IWish;
  size?: "sm" | "md" | "lg" | undefined;
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
            <Chip color="accent" size={size} variant="primary">
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
            <Chip color="success" size="lg" variant="primary">
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
