import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { motion } from "framer-motion";

import { defaultVariants } from "@/lib/animations/default";

export const StartButton = ({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) => {
  return (
    <motion.div
      className={`mx-auto  ${className}`}
      initial="initial"
      variants={defaultVariants}
      viewport={{ once: true }}
      whileInView="animate"
    >
      <Button
        as={Link}
        className="mt-4 py-8 text-2xl text-center"
        color="primary"
        href="/auth/login"
      >
        {title}
      </Button>
    </motion.div>
  );
};
