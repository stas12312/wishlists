import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

import { containerVariants, itemVariants } from "./animation";

export const CardsList = observer(
  ({
    items,
    gridConfig = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  }: {
    items: Array<ReactElement | null>;
    gridConfig?: string;
  }) => {
    return (
      <motion.div
        animate="show"
        className={`grid gap-4 col-span-full ${gridConfig}`}
        initial="hidden"
        variants={containerVariants}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            if (!item) {
              return null;
            }
            return (
              <motion.div
                key={item.key}
                layout
                animate={{
                  opacity: 1,
                  transform: "translateY(0px)",
                  transition: { duration: 0.3 },
                }}
                exit={{
                  opacity: 0,
                  transform: "translateY(-20px)",
                  transition: { duration: 0.1 },
                }}
                variants={itemVariants}
              >
                {item}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  },
);
