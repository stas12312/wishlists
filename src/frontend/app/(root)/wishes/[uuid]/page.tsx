import { WishPage } from "@/components/wish/WishPage";

export const metadata = {
  title: "Желание",
  openGraph: { title: "Желание", description: "Подробности желания" },
};

export default async function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return <WishPage key={uuid} uuid={uuid} />;
}
