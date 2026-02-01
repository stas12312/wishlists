import { motion } from "framer-motion";
import { Image } from "@heroui/image";

import { itemVariants } from "./main";

export const DescriptionBlock = ({
  title,
  description,
  imageUrl = undefined,
  className = "",
}: {
  title: string;
  description: string;
  imageUrl?: string | undefined;
  className?: string;
}) => {
  return (
    <motion.div
      className={
        "p-4 shadow-md rounded-xl w-full bg-content1 border-default-200 border dark:border-none " +
        className
      }
      initial="hidden"
      variants={itemVariants}
      viewport={{ once: true }}
      whileHover={{ transform: "translateY(-10px)" }}
      whileInView="show"
    >
      {imageUrl ? (
        <Image
          removeWrapper
          className="shadow-md border-default-200 border"
          src={imageUrl}
        />
      ) : null}

      <div className={"flex items-center " + (!imageUrl ? "" : "")}>
        <div className="flex flex-col p-2 lg:p-6 gap-1 w-full">
          <p className="text-2xl text-center font-bold" title={title}>
            {title}
          </p>
          <p className="text-xl text-center" title={description}>
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
