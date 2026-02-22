import { getOgImage } from "@/components/ogImage";

export const runtime = "edge";
export const alt = "Блог";

export const contentType = "image/png";

export default async function Image() {
  let title = "Блог";

  return await getOgImage(title, "", "");
}
