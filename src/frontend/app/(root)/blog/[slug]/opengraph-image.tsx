import { getOgImage } from "@/components/ogImage";
import { getArticleBySlug } from "@/lib/server-requests/article";

export const runtime = "edge";
export const alt = "Блог";

export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const slug = (await params).slug;
  const article = await getArticleBySlug(slug);

  let title = "Блог";
  let description = "";
  if (article) {
    title = article.title;
    description = article.description || "";
  }

  return await getOgImage(title, description, "");
}
