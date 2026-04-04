import FriendsList from "@/components/friend/FriendList";
import PageHeader from "@/components/PageHeader";

const UserFriendsPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const username = (await params).username;
  return (
    <>
      <PageHeader title="Друзья пользователя" />
      <FriendsList username={username} />
    </>
  );
};

export default UserFriendsPage;
