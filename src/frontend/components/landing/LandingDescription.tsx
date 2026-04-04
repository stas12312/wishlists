import { motion } from "framer-motion";

import { ResponsiveImage } from "../ResponsiveImage";

import { itemVariants } from "./Landing";

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
        "p-4 shadow-md rounded-3xl w-full surface surface--default border-default border dark:border-none " +
        className
      }
      initial="hidden"
      variants={itemVariants}
      viewport={{ once: true }}
      whileHover={{ transform: "translateY(-10px)" }}
      whileInView="show"
    >
      {imageUrl ? (
        <ResponsiveImage
          alt="Изображение описания"
          className="shadow-md  border w-full rounded-3xl"
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
