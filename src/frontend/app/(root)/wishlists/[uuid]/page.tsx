import { Metadata } from "next";

import Wishes from "@/components/wish/WishList";
import {
  DEFAULT_WISHLIST_COLOR,
  DEFAULT_WISHLIST_EMOJI,
} from "@/components/wishlist/wishlistAppearance";
import { getOgImageUrl } from "@/lib/label";
import { getWishlist } from "@/lib/server-requests/wishlist";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const uuid = (await params).uuid;

  const wishlist = await getWishlist(uuid);
  if ("message" in wishlist) {
    return {};
  }

  return {
    title: `Вишлист - ${wishlist.name}`,
    openGraph: {
      title: wishlist.name,
      description: wishlist.description,
      images: [
        getOgImageUrl(
          wishlist.name,
          wishlist.description,
          wishlist.user?.name,
          {
            color: wishlist.settings?.color || DEFAULT_WISHLIST_COLOR,
            emoji: wishlist.settings?.emoji || DEFAULT_WISHLIST_EMOJI,
          },
        ),
      ],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const wishlist_uuid = (await params).uuid;

  return <Wishes wishlistUUID={wishlist_uuid} />;
}
