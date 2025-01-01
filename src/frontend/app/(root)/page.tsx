import Landing from "@/components/landing";
import { Wishlists } from "@/components/wishlist/list";
import { getUserFromCookies } from "@/lib/auth";
import { Divider } from "@nextui-org/divider";
import { cookies } from "next/headers";

export default async function Home() {
  const userId = await getUserFromCookies();
  if (userId) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <h1 className="text-2xl col-span-full text-center lg:text-left">
            Мои вишлисты
          </h1>
          <Divider className="col-span-full" />
        </div>

        <section className="mt-4">
          <Wishlists actions={{ edit: true, filter: true }} userId={userId} />
        </section>
      </>
    );
  } else {
    return <Landing />;
  }
}
