import { Button } from "@heroui/react";
import Link from "next/link";
import { IoMdHeart } from "react-icons/io";

export const SupportButton = ({ className = "" }: { className?: string }) => {
  return (
    <Button
      className={`bg-linear-to-r dark:from-amber-800 dark:to-amber-700 from-amber-400 to-amber-300 shadow-sm ${className}`}
      variant="primary"
    >
      <IoMdHeart className="text-rose-500 dark:text-rose-400" />
      <Link href={process.env.NEXT_PUBLIC_DONATE_URL ?? ""} target="_blank">
        Поддержать проект
      </Link>
    </Button>
  );
};
