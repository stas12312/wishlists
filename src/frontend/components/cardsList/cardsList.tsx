import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

import { containerVariants, itemVariants } from "./animation";

export const CardsList = observer(
  ({ items }: { items: Array<ReactElement | null> }) => {
    return (
      <motion.div
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 col-span-full"
        exit="exit"
        initial="hidden"
        variants={containerVariants}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            return item ? (
              <motion.div
                key={item.key}
                layout
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                variants={itemVariants}
              >
                {item}
              </motion.div>
            ) : null;
          })}
        </AnimatePresence>
      </motion.div>
    );
  },
);
