import { getOgImage } from "@/components/ogImage";

export const runtime = "edge";
export const alt = "Вишлист";

export const contentType = "image/png";

export default async function Image() {
  return await getOgImage(
    "MyWishlists",
    "Сервис для составления вишлистов",
    "",
  );
}
