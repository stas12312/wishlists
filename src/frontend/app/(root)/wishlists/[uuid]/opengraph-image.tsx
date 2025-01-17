import { getOgImage } from "@/components/ogImage";
import { getWishlist } from "@/lib/requests";

export const runtime = "edge";
export const alt = "Вишлист";

export const contentType = "image/png";

export default async function Image({ params }: { params: { uuid: string } }) {
  const wishlist = await getWishlist(params.uuid);

  let title = "Вишлист";
  let description = "";
  let user = { name: "" };
  if (!("message" in wishlist)) {
    title = wishlist.name;
    description = wishlist.description || "";
    user.name = wishlist.user?.name || "";
  }

  return await getOgImage(title, description, user.name);
}
