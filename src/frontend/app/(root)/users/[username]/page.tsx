import { Metadata } from "next";

import UserView from "@/components/userPage";
import { getUserByUsername } from "@/lib/requests";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const username = (await params).username;

  const user = await getUserByUsername(username);
  if ("message" in user) {
    return {};
  }

  return {
    title: user.name,
    openGraph: {
      title: user.name,
      description: `${user.name} вишлисты пользователя`,
    },
  };
}

const UserPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const username = (await params).username;
  return <UserView username={username} />;
};

export default UserPage;
