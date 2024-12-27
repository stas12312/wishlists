import Landing from "@/components/landing";
import { Wishlists } from "@/components/wishlist/list";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const isLogin = cookieStore.has("access_token");
  if (isLogin) {
    return (
      <section>
        <Wishlists />
      </section>
    );
  } else {
    return <Landing />;
  }
}
