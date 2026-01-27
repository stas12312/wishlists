import { motion } from "framer-motion";

import { defaultVariants } from "@/lib/animations/default";

export const Video = ({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) => {
  return (
    <motion.video
      autoPlay
      loop
      muted
      animate="animate"
      className={
        "rounded-2xl lg:border-r-10 lg:border-t-large transform-gpu shadow-sm border object-cover " +
        className
      }
      exit="exit"
      initial="initial"
      src={src}
      variants={defaultVariants}
    />
  );
};
