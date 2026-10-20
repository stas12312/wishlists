import { buttonVariants } from "@heroui/react";
import { IoMdHeart } from "react-icons/io";

export const SupportButton = ({ className = "" }: { className?: string }) => {
  return (
    <a
      className={buttonVariants({
        variant: "primary",
        className: `bg-linear-to-r dark:from-amber-800 dark:to-amber-700 from-amber-400 to-amber-300 shadow-sm ${className}`,
      })}
      href={process.env.NEXT_PUBLIC_DONATE_URL}
      rel="noopener noreferrer"
      target="_blank"
    >
      <IoMdHeart className="text-rose-500 dark:text-rose-400" />
      Поддержать проект
    </a>
  );
};
