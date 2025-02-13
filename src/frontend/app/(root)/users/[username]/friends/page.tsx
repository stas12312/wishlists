import FriendsList from "@/components/friends/list";
import PageHeader from "@/components/pageHeader";

const UserFriendsPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const username = (await params).username;
  return (
    <>
      <PageHeader>Друзья пользователя</PageHeader>
      <FriendsList username={username} />
    </>
  );
};

export default UserFriendsPage;
