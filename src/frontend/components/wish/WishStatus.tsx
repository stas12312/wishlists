import { Chip } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";

import { IWish } from "@/lib/models/wish";
import { defaultVariants } from "@/lib/animations/default";

const WishStatus = ({
  wish,
  size = "md",
  hideReserved = false,
}: {
  wish: IWish;
  size?: "sm" | "md" | "lg" | undefined;
  hideReserved?: boolean;
}) => {
  const byYou = wish.actions.cancel_reserve ? " вами" : "";
  const status = wish.fulfilled_at
    ? { color: "accent" as const, text: `Исполнено${byYou}` }
    : wish.is_reserved && !hideReserved
      ? { color: "success" as const, text: `Забронировано${byYou}` }
      : null;

  return (
    <AnimatePresence>
      {status ? (
        <motion.span
          key={wish.uuid}
          animate="animate"
          exit="exit"
          initial="initial"
          variants={defaultVariants}
        >
          <Chip color={status.color} size={size} variant="primary">
            {status.text}
          </Chip>
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
};

export default WishStatus;
