import { Divider } from "@nextui-org/divider";
import { cookies } from "next/headers";

import { Contacts } from "@/components/contacts";
import Login from "@/components/login";
import Menu from "@/components/menu";
import { ThemeSwitcher } from "@/components/themeSwitcher";
import { UserItem } from "@/components/user";
import Version from "@/components/version";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLogin = cookieStore.has("access_token");
  return (
    <div className="flex flex-col  min-h-screen justify-between">
      <div>
        <header className="w-full flex col-span-full justify-between md:justify-end px-4 py-4 gap-4">
          <ThemeSwitcher />
          {isLogin ? <UserItem /> : <Login />}
        </header>
        <Divider className="md:hidden" />

        <div className="gap-1 pb-4 flex">
          {isLogin ? (
            <>
              <div className="hidden md:block col-span-full flex-col w-[240px]">
                <div className="sticky top-10 hidden md:block px-4">
                  <Menu variant="desktop" />
                  <footer className="px-1">
                    <Divider />
                    <Contacts />
                    <Version />
                  </footer>
                </div>
              </div>
            </>
          ) : null}
          <div className={`px-3 md:px-4 lg:px-4 w-full`}>
            <main>{children}</main>
          </div>
        </div>
      </div>
      <span className={`"mt-auto" ${isLogin ? "md:hidden" : ""}`}>
        <footer
          className={`flex items-center justify-between ${isLogin ? "mb-20 md:mb-0" : ""} px-3`}
        >
          <Version />
          <Contacts />
        </footer>
      </span>
      {isLogin ? (
        <div className=" bg-content1 bg-opacity-50 backdrop-blur-xl fixed inset-x-0 bottom-0 z-10 shadow-medium md:hidden">
          <Menu variant="mobile" />
        </div>
      ) : null}
    </div>
  );
}
