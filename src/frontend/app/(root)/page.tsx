import Landing from "@/components/landing/Landing";
import { Wishlists } from "@/components/wishlist/Wishlist";
import { getUserFromCookies } from "@/lib/auth";

export default async function Home() {
  const userId = await getUserFromCookies();
  if (userId) {
    return (
      <section>
        <Wishlists
          actions={{ edit: true, filter: true }}
          title="Вишлисты"
          userId={userId}
        />
      </section>
    );
  } else {
    return <Landing />;
  }
}
