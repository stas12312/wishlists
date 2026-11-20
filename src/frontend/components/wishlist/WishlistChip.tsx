import { chipVariants } from "@heroui/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

import {
  DEFAULT_WISHLIST_EMOJI,
  getWishlistAccent,
} from "./wishlistAppearance";

import { IWishlistSettings } from "@/lib/models/wishlist";

export const WishlistChip = ({
  uuid,
  name,
  settings,
  className,
}: {
  uuid: string;
  name: string;
  settings?: IWishlistSettings;
  className?: string;
}) => {
  const chipStyle = chipVariants({ color: "accent", variant: "soft" });
  return (
    <Link
      className={twMerge(
        chipStyle.base(),
        getWishlistAccent(uuid, settings?.color),
        className,
        "rounded-full h-8 max-w-full",
      )}
      href={`/wishlists/${uuid}`}
    >
      <span aria-hidden="true" className="shrink-0">
        {settings?.emoji || DEFAULT_WISHLIST_EMOJI}
      </span>
      <span className="text-sm truncate">{name}</span>
    </Link>
  );
};
