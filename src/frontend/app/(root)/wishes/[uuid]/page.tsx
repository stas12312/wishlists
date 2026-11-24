import { UnavailablePage } from "@/components/UnavailablePage";
import { WishPage } from "@/components/wish/WishPage";
import { getWish, getWishQuestions } from "@/lib/server-requests/wish";
import { getWishlist } from "@/lib/server-requests/wishlist";

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

  const wish = await getWish(uuid).catch(() => null);
  if (!wish?.uuid || wish.is_active === false) {
    return (
      <UnavailablePage
        description="Возможно, желание удалено или у вас нет доступа к его вишлисту."
        title="Желание недоступно"
      />
    );
  }

  const [wishlist, questions] = await Promise.all([
    getWishlist(wish.wishlist_uuid).catch(() => undefined),
    getWishQuestions(wish.uuid).catch(() => undefined),
  ]);

  return (
    <WishPage
      key={uuid}
      initialQuestions={questions}
      initialWish={wish}
      wishlistColor={
        wishlist && !("message" in wishlist)
          ? wishlist.settings?.color
          : undefined
      }
    />
  );
}
