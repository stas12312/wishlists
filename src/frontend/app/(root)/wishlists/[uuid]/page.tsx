import { Metadata } from "next";

import Wishes from "@/components/wishlist/detail";
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
