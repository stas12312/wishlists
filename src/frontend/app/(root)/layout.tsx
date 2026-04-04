import clsx from "clsx";
import { cookies } from "next/headers";
import { twMerge } from "tailwind-merge";

import { Contacts } from "@/components/Contacts";
import { Header } from "@/components/Header";
import Menu from "@/components/Menu";
import { SupportButton } from "@/components/SupportButton";
import Version from "@/components/Version";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLogin = cookieStore.has("refresh_token");
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <div>
        <Header isLogin={isLogin} />

        <div className="gap-1 pb-4 flex mt-4">
          {isLogin ? (
            <div className="hidden md:block col-span-full flex-col w-80">
              <div className="sticky top-22 hidden md:block ml-2">
                <Menu variant="desktop" />
                <footer className="my-2 w-full px-2 flex flex-col justify-center items-center gap-2">
                  <SupportButton className="mt-4 w-full" />
                  <Contacts />
                  <Version />
                </footer>
              </div>
            </div>
          ) : null}
          <div className="px-3 md:px-4 lg:px-4 py-3 w-full">
            <main>{children}</main>
          </div>
        </div>
      </div>
      <span className={clsx(isLogin ? "md:hidden mb-30 md:mb-0" : "")}>
        {isLogin ? (
          <div className="mx-3">
            <SupportButton className="mt-2 w-full md:mx-0" />
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
