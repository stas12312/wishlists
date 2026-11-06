"use client";

import { Card, Skeleton } from "@heroui/react";
import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";

import { VisibleChip } from "../VisibleChip";

import { wishlistChipClassName, WishlistTypeChip } from "./WishlistChips";
import WishlistItemMenu from "./WishlistMenu";
import {
  DEFAULT_WISHLIST_EMOJI,
  getWishlistGradient,
} from "./wishlistAppearance";

import { getLabelForCount } from "@/lib/label";
import { IWishlist } from "@/lib/models/wishlist";

export const WishlistItem = forwardRef(
  (
    {
      wishlist,
      onDelete,
      onRestore,
      edit = true,
    }: {
      wishlist: IWishlist;
      onDelete: { (wishlist: IWishlist): Promise<void> };
      onRestore: { (wishlist: IWishlist): void };
      edit?: boolean;
    },
    ref: any,
  ) => {
    const [cardWishlist, setCardWishlist] = useState<IWishlist>(wishlist);

    const router = useRouter();
    function onUpdate(wishlist: IWishlist): void {
      setCardWishlist(wishlist);
    }

    return (
      <div className="group relative transition-transform duration-200 md:hover:scale-[1.02]">
        <Card
          ref={ref}
          className="h-52 flex-col gap-0 overflow-hidden p-0 shadow-sm transition-transform duration-200 has-[button:active]:scale-[0.98]"
        >
          <div
            className={`relative flex h-full cursor-pointer flex-col overflow-hidden bg-gradient-to-br text-left ${getWishlistGradient(cardWishlist.uuid, cardWishlist.settings?.color)} ${!cardWishlist.is_active ? "grayscale" : ""}`}
          >
            <button
              aria-label={`Открыть вишлист ${cardWishlist.name}`}
              className="absolute inset-0 z-10 cursor-pointer"
              type="button"
              onClick={() => router.push(`/wishlists/${wishlist.uuid}`)}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-4 flex size-52 rotate-[-18deg] select-none items-center justify-center text-[180px] leading-none opacity-[0.16] transition-transform duration-500 ease-out [mask-image:linear-gradient(135deg,transparent_5%,black_65%)] group-has-[:focus-visible]:rotate-[-8deg] group-has-[:focus-visible]:scale-110 motion-reduce:transition-none motion-reduce:group-has-[:focus-visible]:transform-none dark:opacity-[0.12] md:group-hover:rotate-[-8deg] md:group-hover:scale-110 motion-reduce:md:group-hover:transform-none"
            >
              {cardWishlist.settings?.emoji || DEFAULT_WISHLIST_EMOJI}
            </span>
            <div className="pointer-events-none relative flex h-16 shrink-0 items-center px-2">
              <div className="relative z-10 flex size-12 items-center justify-center rounded-2xl bg-white/40 text-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.24)] dark:bg-white/10 dark:text-white">
                <span
                  aria-label="Эмодзи вишлиста"
                  className="text-3xl drop-shadow-[0_2px_3px_rgba(15,23,42,0.4)]"
                  role="img"
                >
                  {cardWishlist.settings?.emoji || DEFAULT_WISHLIST_EMOJI}
                </span>
              </div>
            </div>

            <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
              <Card.Header className="shrink-0 flex-col items-start px-4 pb-0 pt-1">
                <p
                  className={`w-full truncate text-xl font-semibold ${!cardWishlist.is_active ? "text-slate-900/50 dark:text-white/50" : "text-slate-900 dark:text-white"}`}
                  title={cardWishlist.name}
                >
                  {cardWishlist.name}
                </p>
              </Card.Header>
              <Card.Content className="min-h-0 flex-1 px-4 py-1">
                <p
                  className="line-clamp-2 text-sm text-slate-700 dark:text-white/75"
                  title={cardWishlist.description}
                >
                  {cardWishlist.description}
                </p>
              </Card.Content>
              <Card.Footer className="flex shrink-0 flex-wrap items-center gap-1.5 p-2">
                <WishlistTypeChip forOther={cardWishlist.settings?.for_other} />
                <span className={`${wishlistChipClassName} shrink-0`}>
                  {cardWishlist.wishes_count}{" "}
                  {getLabelForCount(cardWishlist.wishes_count, [
                    "желание",
                    "желания",
                    "желаний",
                  ])}
                </span>
                {cardWishlist.date ? (
                  <time
                    className={`${wishlistChipClassName} ml-auto`}
                    dateTime={cardWishlist.date}
                  >
                    <span className="truncate">
                      {new Date(cardWishlist.date).toLocaleDateString("ru-RU")}
                    </span>
                  </time>
                ) : null}
              </Card.Footer>
            </div>
          </div>
          {edit ? (
            <>
              <div className="absolute left-1/2 top-2 z-20 w-max max-w-[calc(100%-8rem)] -translate-x-1/2">
                <VisibleChip short wishlist={cardWishlist} />
              </div>
              <div className="absolute right-2 top-2 z-20 rounded-full text-slate-800 backdrop-blur-sm dark:text-white">
                <WishlistItemMenu
                  className="h-8 rounded-full bg-black/5 shadow-none hover:bg-black/10 dark:bg-black/15 dark:hover:bg-black/25"
                  isEditable={true}
                  wishlist={cardWishlist}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onUpdate={onUpdate}
                />
              </div>
            </>
          ) : null}
        </Card>
      </div>
    );
  },
);

export function WishlistsSkeletonItem() {
  return (
    <Card className="h-52 gap-0 overflow-hidden p-0">
      <Skeleton className="h-16 w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-6 w-3/5 rounded-lg" />
        <Skeleton className="h-4 w-4/5 rounded-lg" />
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

WishlistItem.displayName = "WishlistItem";
