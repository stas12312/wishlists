import { observer } from "mobx-react-lite";
import { Chip } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";

import { IWish } from "@/lib/models/wish";
import { defaultVariants } from "@/lib/animations/default";
import userStore from "@/store/userStore";

const WishStatus = ({
  wish,
  size = "md",
  hideReserved = false,
}: {
  wish: IWish;
  size?: "sm" | "md" | "lg" | undefined;
  hideReserved?: boolean;
}) => {
  const checked =
    wish.actions.edit &&
    !wish.actions.show_reservations &&
    wish.uuid &&
    !hideReserved
      ? userStore.getCheckedReservation(wish.uuid)
      : undefined;
  const byYou = wish.actions.cancel_reserve ? " вами" : "";
  const status = wish.fulfilled_at
    ? { color: "accent" as const, text: `Исполнено${byYou}` }
    : (checked ?? wish.is_reserved) && !hideReserved
      ? { color: "success" as const, text: `Забронировано${byYou}` }
      : checked === false
        ? { color: "accent" as const, text: "Не забронировано" }
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
          <Chip
            className={
              status.color === "accent"
                ? "[--accent:var(--color-blue-600)] [--accent-foreground:white]"
                : undefined
            }
            color={status.color}
            size={size}
            variant="primary"
          >
            {status.text}
          </Chip>
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
};

export default observer(WishStatus);
