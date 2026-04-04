import UserCard from "@/components/user/UserCard";

export default async function Layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;
  return (
    <>
      <UserCard username={username} />
      {children}
    </>
  );
}
