import { cookies } from "next/headers";

import { Contacts } from "@/components/contacts";
import Menu from "@/components/menu";
import Version from "@/components/version";
import { SupportButton } from "@/components/supportButton";
import { Header } from "@/components/header";
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
              <div className="sticky top-22 hidden md:block">
                <Menu variant="desktop" />
                <footer className="my-2 w-full px-2">
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
      <span className={` ${isLogin ? "md:hidden" : ""}`}>
        {isLogin ? (
          <div className="mx-3">
            <SupportButton className="mt-2 w-full md:mx-0" />
          </div>
        ) : null}

        <footer
          className={`flex items-center justify-between ${isLogin ? "mb-20 md:mb-0" : ""} px-3`}
        >
          <Contacts />
          <Version />
        </footer>
      </span>
      {isLogin ? <Menu variant="mobile" /> : null}
    </div>
  );
}
