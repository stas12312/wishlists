import { chipVariants } from "@heroui/react";
import Link from "next/link";
import { MdAutoAwesome } from "react-icons/md";
import { twMerge } from "tailwind-merge";

export const WishlistChip = ({
  uuid,
  name,
  className,
  variant,
}: {
  uuid: string;
  name: string;
  className?: string;
  variant?: "primary" | "secondary" | "soft" | "tertiary" | undefined;
}) => {
  const chipStyle = chipVariants({ variant: variant });
  return (
    <Link
      className={twMerge(
        chipStyle.base(),
        className,
        "rounded-full h-8 max-w-full",
      )}
      href={`/wishlists/${uuid}`}
    >
      <MdAutoAwesome className="shrink-0 text-yellow-500" />
      <span className="text-sm truncate">{name}</span>
    </Link>
  );
};
