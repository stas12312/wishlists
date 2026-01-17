import { getOgImage } from "@/components/ogImage";
import { getUserByUsername } from "@/lib/client-requests/user";

export const runtime = "edge";
export const alt = "Вишлист";

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUserByUsername(params.username);
  return await getOgImage(user.name, "", "Профиль пользователя");
}
