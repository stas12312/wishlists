import Landing from "@/components/landing";
import { Wishlists } from "@/components/wishlist/list";
import { getUserFromCookies } from "@/lib/auth";
import PageHeader from "@/components/pageHeader";

export default async function Home() {
  const userId = await getUserFromCookies();
  if (userId) {
    return (
      <>
        <PageHeader>Вишлисты</PageHeader>
        <section>
          <Wishlists actions={{ edit: true, filter: true }} userId={userId} />
        </section>
      </>
    );
  } else {
    return <Landing />;
  }
}
