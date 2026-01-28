import { motion } from "framer-motion";

import { defaultVariants } from "@/lib/animations/default";

export const Video = (
  {
    src,
    posterSrc = "",
    className = "",
  }: {
    src: string;
    posterSrc: string;
    className?: string;
  },
  key: string,
) => {
  return (
    <motion.video
      key={key}
      autoPlay
      layout
      loop
      muted
      playsInline
      animate="animate"
      className={
        "rounded-2xl transform-gpu shadow-lg object-cover " + className
      }
      exit="exit"
      initial="initial"
      poster={posterSrc}
      src={src}
      variants={defaultVariants}
    />
  );
};
