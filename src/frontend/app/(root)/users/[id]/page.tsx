import UserView from "@/components/userPage";

const UserPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const userId = parseInt((await params).id);
  return <UserView userId={userId} />;
};

export default UserPage;

