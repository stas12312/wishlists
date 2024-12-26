import UserView from "@/components/userPage";

const UserPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const username = (await params).username;
  return <UserView username={username} />;
};

export default UserPage;
