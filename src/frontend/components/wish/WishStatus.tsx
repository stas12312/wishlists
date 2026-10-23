import { Chip } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

import { IWish } from "@/lib/models/wish";
import { defaultVariants } from "@/lib/animations/default";

const WishStatus = ({
  wish,
  size = "md",
  banner = false,
}: {
  wish: IWish;
  size?: "sm" | "md" | "lg" | undefined;
  banner?: boolean;
}) => {
  const byYou = wish.actions.cancel_reserve ? " вами" : "";
  const status = wish.fulfilled_at
    ? { color: "accent" as const, text: `Исполнено${byYou}` }
    : wish.is_reserved
      ? { color: "success" as const, text: `Забронировано${byYou}` }
      : null;

  return (
    <AnimatePresence>
      {status ? (
        <motion.span
          key={wish.uuid}
          animate="animate"
          className={banner ? "block w-full" : undefined}
          exit="exit"
          initial="initial"
          variants={defaultVariants}
        >
          {banner ? (
            <div
              className={twMerge(
                "flex h-8 w-full items-center justify-center text-sm font-medium",
                status.color === "accent"
                  ? "bg-accent dark:bg-accent/80 text-accent-foreground"
                  : "bg-success dark:bg-success/80 text-success-foreground",
              )}
            >
              {status.text}
            </div>
          ) : (
            <Chip color={status.color} size={size} variant="primary">
              {status.text}
            </Chip>
          )}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
};

export default WishStatus;
