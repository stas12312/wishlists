import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { defaultVariants } from "@/lib/animations/default";

export const StartButton = ({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) => {
  const router = useRouter();
  return (
    <motion.div
      className={`mx-auto  ${className}`}
      initial="initial"
      variants={defaultVariants}
      viewport={{ once: true }}
      whileInView="animate"
    >
      <Button
        className="mt-4 py-8 text-2xl text-center"
        variant="primary"
        onPress={() => {
          router.push("/auth/login");
        }}
      >
        {title}
      </Button>
    </motion.div>
  );
};
