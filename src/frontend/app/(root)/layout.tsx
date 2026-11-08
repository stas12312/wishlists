import clsx from "clsx";
import { cookies, headers } from "next/headers";
import { twMerge } from "tailwind-merge";

import { Contacts } from "@/components/Contacts";
import { Header } from "@/components/Header";
import Menu from "@/components/Menu";
import { SupportButton } from "@/components/SupportButton";
import { SupportLink } from "@/components/SupportLink";
import Version from "@/components/Version";
import { BackgroundDecoration } from "@/components/BackgroundDecoration";
import { LeftPanel } from "@/components/left-panel/LeftPanel";
import { getUserFromCookies } from "@/lib/auth";
import { getWishlist } from "@/lib/server-requests/wishlist";
import { ProfileProvider } from "@/providers/ProfileProvider";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLogin = cookieStore.has("refresh_token");
  const pathname = (await headers()).get("x-profile-pathname") ?? "";
  const wishlistUUID = pathname.match(/^\/wishlists\/([^/]+)\/?$/)?.[1];
  const [wishlist, userId] = await Promise.all([
    wishlistUUID ? getWishlist(wishlistUUID) : null,
    getUserFromCookies(),
  ]);
  return (
    <div className="relative flex flex-col min-h-screen justify-between">
      <div>
        <Header isLogin={isLogin} />
        {isLogin ? <BackgroundDecoration /> : null}

        <div className="gap-1 pb-4 flex mt-4">
          {isLogin ? (
            <LeftPanel>
              <Menu variant="desktop" />
              <footer className="my-2 w-full px-2 flex flex-col justify-center items-center gap-2">
                <SupportButton className="mt-4 w-full" />
                <SupportLink className="w-full" />
                <Contacts />
                <Version />
              </footer>
            </LeftPanel>
          ) : null}
          <div className="px-3 md:px-4 lg:px-4 py-3 w-full">
            <main>
              <ProfileProvider
                initialUserId={userId ?? 0}
                initialWishlist={
                  wishlist && !("message" in wishlist) ? wishlist : null
                }
                initialWishlistUUID={wishlistUUID}
              >
                {children}
              </ProfileProvider>
            </main>
          </div>
        </div>
      </div>
      <span className={clsx(isLogin ? "md:hidden mb-30 md:mb-0" : "")}>
        {isLogin ? (
          <div className="mx-3 mt-2 flex flex-col gap-2">
            <SupportButton className="w-full md:mx-0" />
            <SupportLink className="w-full" />
          </div>
        ) : null}

        <footer
          className={twMerge(
            "flex flex-col md:flex-row gap-4 items-center justify-between px-3",
            isLogin ? "md:mb-0 mt-4" : "",
          )}
        >
          <Contacts />
          <Version />
        </footer>
      </span>
      {isLogin ? <Menu variant="mobile" /> : null}
    </div>
  );
}
