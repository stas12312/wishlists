"use client";

import { Card, toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useWishActions } from "./useWishActions";
import { WISH_CARD_CLASS_NAME, WishCardBackdrop } from "./WishCardBackdrop";
import { WishCreatedAt, WishDetails } from "./WishDetails";

import { CustomBreadcrumbs } from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import { UserChip } from "@/components/user/UserChip";
import { getWishlistAccent } from "@/components/wishlist/wishlistAppearance";
import { IQuestion } from "@/lib/models/question";
import { IWish } from "@/lib/models/wish";

export function WishPage({
  initialWish,
  initialQuestions,
  wishlistColor,
}: {
  initialWish: IWish;
  initialQuestions?: IQuestion[];
  wishlistColor?: string;
}) {
  const router = useRouter();
  const [wish, setWish] = useState(initialWish);
  const wishlistHref = `/wishlists/${wish.wishlist_uuid}`;
  const wishlistName = wish.wishlist?.name || "Вишлист";
  const accentClass = getWishlistAccent(wish.wishlist_uuid, wishlistColor);

  const { handleOnAction, modals } = useWishActions({
    wish,
    className: accentClass,
    onUpdate: setWish,
    onDelete: (_, message) => {
      toast(message);
      router.replace(wishlistHref);
    },
  });
  const ownerChip = wish.user?.username ? (
    <UserChip
      className="wishlist-card-user-chip self-start"
      user={wish.user}
      variant="secondary"
    />
  ) : null;

  return (
    <article className="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-3 md:max-w-none">
      <div className="hidden md:block">
        <PageHeader dividerClassName="mt-2">
          <CustomBreadcrumbs
            items={[
              { title: wishlistName, href: wishlistHref },
              { title: wish.name, href: `/wishes/${wish.uuid}` },
            ]}
          />
        </PageHeader>
      </div>
      <div className="md:hidden">
        <PageHeader dividerClassName="mt-2">
          <Link
            className="mx-auto max-w-full text-center text-2xl text-muted wrap-anywhere"
            href={wishlistHref}
          >
            {wishlistName}
          </Link>
        </PageHeader>
      </div>
      <Card
        className={`mx-auto max-w-xl lg:max-w-5xl ${WISH_CARD_CLASS_NAME} ${accentClass}`}
      >
        <WishCardBackdrop
          color={wishlistColor}
          image={wish.images?.[0]}
          wishlistUUID={wish.wishlist_uuid}
        />
        <Card.Header className="relative flex flex-col items-stretch gap-2 px-2.5 pt-4 md:hidden">
          {ownerChip ? (
            <div className="flex justify-center">{ownerChip}</div>
          ) : null}
          <h1 className="min-w-0 text-center text-2xl wrap-anywhere">
            {wish.name}
          </h1>
        </Card.Header>
        <Card.Content className="relative flex min-w-0 flex-col gap-4 px-2.5 pt-3 lg:grid lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto] lg:gap-x-8 lg:px-6 lg:pt-6">
          <WishDetails
            twoColumns
            afterDescription={
              ownerChip ? (
                <div className="hidden md:contents">{ownerChip}</div>
              ) : null
            }
            initialQuestions={initialQuestions}
            wish={wish}
            onAction={handleOnAction}
          />
        </Card.Content>
        <Card.Footer className="relative empty:hidden px-2.5 py-2 lg:px-6 lg:py-4">
          <WishCreatedAt wish={wish} />
        </Card.Footer>
      </Card>
      {modals}
    </article>
  );
}
