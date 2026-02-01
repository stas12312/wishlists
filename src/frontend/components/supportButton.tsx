import { Button } from "@heroui/button";
import { IoMdHeart } from "react-icons/io";
import { Link } from "@heroui/link";

export const SupportButton = ({ className = "" }: { className?: string }) => {
  return (
    <Button
      as={Link}
      className={`bg-linear-to-r dark:from-amber-800 dark:to-amber-700 from-amber-400 to-amber-300 shadow-sm ${className}`}
      href={process.env.NEXT_PUBLIC_DONATE_URL}
      startContent={<IoMdHeart className="text-rose-500 dark:text-rose-400" />}
      target="_blank"
      variant="light"
    >
      Поддержать проект
    </Button>
  );
};
