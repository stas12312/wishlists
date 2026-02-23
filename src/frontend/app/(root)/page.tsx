import Landing from "@/components/landing/main";
import { Wishlists } from "@/components/wishlist/list";
import { getUserFromCookies } from "@/lib/auth";
import PageHeader from "@/components/pageHeader";

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
