import Landing from "@/components/landing/Landing";
import { Wishlists } from "@/components/wishlist/Wishlist";
import { getUserFromCookies } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

export default async function Home() {
  const userId = await getUserFromCookies();
  if (userId) {
    return (
      <>
        <PageHeader title="Вишлисты" />
        <section>
          <Wishlists actions={{ edit: true, filter: true }} userId={userId} />
        </section>
      </>
    );
  } else {
    return <Landing />;
  }
}
