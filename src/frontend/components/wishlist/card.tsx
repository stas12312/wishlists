"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";

import { VisibleStatus } from "../visibleIcon";

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
    const router = useRouter();

    const [cardWishlist, setCardWishlist] = useState<IWishlist>(wishlist);

    function onUpdate(wishlist: IWishlist): void {
      setCardWishlist(wishlist);
    }

    return (
      <div className="md:hover:scale-[1.03] duration-200">
        <Card
          ref={ref}
          className="w-full h-40 flex-col"
          isPressable={wishlist.is_active}
          onPress={() => router.push(`/wishlists/${cardWishlist.uuid}`)}
        >
          <CardHeader className="flex-col items-start">
            <div className="flex flex-row justify-between w-full">
              <div className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden truncate">
                <span
                  className={`flex flex-row gap-1 ${!wishlist.is_active ? "text-default-400" : ""}`}
                >
                  <p className="uppercase text-large" title={cardWishlist.name}>
                    {cardWishlist.name}
                  </p>
                  <span className="text-small">
                    <VisibleStatus visible={cardWishlist.visible} />
                  </span>
                </span>
                <p
                  className="text-default-500 text-left"
                  title={cardWishlist.description}
                >
                  {cardWishlist.description}
                </p>
              </div>
              <div>
                {edit ? (
                  <WishlistItemMenu
                    isEditable={true}
                    wishlist={cardWishlist}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onUpdate={onUpdate}
                  />
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardBody className="justify-end">
            <div className="flow-root">
              <span className=" float-right flex flex-col gap-1">
                <Chip className="mr-0 ml-auto" color="primary">
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
                  <Chip className="text-default-500 mr-0 ml-auto">
                    {new Date(cardWishlist.date).toLocaleDateString()}
                  </Chip>
                ) : null}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  },
);

export function WishlistsSkeletonItem() {
  return (
    <Card className="space-y-5 p-4 h-40" radius="lg">
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200" />
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200" />
        </Skeleton>
      </div>
    </Card>
  );
}

WishlistItem.displayName = "WishlistItem";
