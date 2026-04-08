import { getOgImage } from "@/components/OGImage";
import { getUserByUsername } from "@/lib/client-requests/user";

export const runtime = "edge";
export const alt = "Вишлист";

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  return await getOgImage(user.name, "", "Профиль пользователя");
}
