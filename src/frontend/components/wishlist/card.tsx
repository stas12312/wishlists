"use client";

import { Card, Chip, Skeleton } from "@heroui/react";
import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";
import { usePress } from "react-aria";

import { VisibleChip } from "../visibleChip";

import WishlistItemMenu from "./menu";

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

    let { pressProps, isPressed } = usePress({
      onPress: () => router.push(`/wishlists/${wishlist.uuid}`),
    });

    return (
      <div className="md:hover:scale-[1.03] transition">
        <Card
          ref={ref}
          className="p-0 flex-col h-40 data-[pressed=true]:scale-95 transition"
          data-pressed={isPressed ? "true" : undefined}
          role="button"
        >
          <button {...pressProps} className="cursor-pointer card h-full">
            <Card.Header className="flex-col items-start">
              <div className="flex flex-row justify-between w-full">
                <div className="text-tiny font-bold flex flex-col text-left overflow-hidden truncate">
                  <span
                    className={`flex flex-row gap-1 ${!wishlist.is_active ? "text-default-400" : ""}`}
                  >
                    {edit ? (
                      <VisibleChip onlyIcon wishlist={cardWishlist} />
                    ) : null}

                    <p
                      className="uppercase text-lg my-auto ml-1"
                      title={cardWishlist.name}
                    >
                      {cardWishlist.name}
                    </p>
                  </span>
                  <p
                    className="text-default-foreground/50 text-left text-sm mt-0.5"
                    title={cardWishlist.description}
                  >
                    {cardWishlist.description}
                  </p>
                </div>
                <div>
                  {edit ? (
                    <WishlistItemMenu
                      className="h-8"
                      isEditable={true}
                      wishlist={cardWishlist}
                      onDelete={onDelete}
                      onRestore={onRestore}
                      onUpdate={onUpdate}
                    />
                  ) : null}
                </div>
              </div>
            </Card.Header>
            <Card.Content className="justify-end">
              <div className="flow-root">
                <span className="float-right flex flex-col gap-1">
                  <Chip
                    className="mr-0 ml-auto"
                    color="accent"
                    size="lg"
                    variant="primary"
                  >
                    {cardWishlist.wishes_count > 0
                      ? wishlist.wishes_count
                      : "Нет"}{" "}
                    {getLabelForCount(cardWishlist.wishes_count, [
                      "желание",
                      "желания",
                      "желаний",
                    ])}
                  </Chip>
                  {cardWishlist.date ? (
                    <Chip className="mr-0 ml-auto" size="lg">
                      {new Date(cardWishlist.date).toLocaleDateString()}
                    </Chip>
                  ) : null}
                </span>
              </div>
            </Card.Content>
          </button>
        </Card>
      </div>
    );
  },
);

export function WishlistsSkeletonItem() {
  return (
    <Card className="space-y-5 p-4 h-40">
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg" />
        <Skeleton className="w-4/5 rounded-lg" />
      </div>
    </Card>
  );
}

WishlistItem.displayName = "WishlistItem";
