import Wishes from "@/components/wishlistDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const wishlist_uuid = (await params).uuid;
  return <Wishes wishlistUUID={wishlist_uuid} />;
}
