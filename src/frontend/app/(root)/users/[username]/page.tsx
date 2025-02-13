import { Metadata } from "next";

import { getUserByUsername } from "@/lib/requests";
import PageHeader from "@/components/pageHeader";
import { Wishlists } from "@/components/wishlist/list";

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
  const user = await getUserByUsername(username);
  return (
    <>
      <PageHeader>Вишлисты пользователя</PageHeader>
      {user.id ? (
        <Wishlists actions={{ edit: false, filter: false }} userId={user.id} />
      ) : null}
    </>
  );
};

export default UserPage;
