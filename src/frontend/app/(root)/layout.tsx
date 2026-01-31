import { Divider } from "@heroui/divider";
import { cookies } from "next/headers";

import { Contacts } from "@/components/contacts";
import Login from "@/components/login";
import Menu from "@/components/menu";
import { ThemeSwitcher } from "@/components/themeSwitcher";
import { UserItem } from "@/components/user";
import Version from "@/components/version";
import { Logo } from "@/components/logo";
import { SupportButton } from "@/components/supportButton";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLogin = cookieStore.has("refresh_token");
  return (
    <div className="flex flex-col  min-h-screen justify-between">
      <div>
        <header className="flex z-10  m-2">
          <div className="w-[240px] flex-shrink-0 hidden  p-4 items-center md:flex justify-center">
            <Logo />
          </div>
          <div className="p-4 gap-4 w-full flex col-span-full justify-between md:justify-end">
            <ThemeSwitcher />
            {isLogin ? <UserItem /> : <Login />}
          </div>
        </header>

        <div className="gap-1 pb-4 flex">
          {isLogin ? (
            <div className="hidden md:block col-span-full flex-col w-[240px]">
              <div className="sticky top-10 hidden md:block px-4">
                <Menu variant="desktop" />

                <footer className="my-2">
                  <Divider />
                  <SupportButton className="mt-4" />
                  <Contacts />
                  <Version />
                </footer>
              </div>
            </div>
          ) : null}
          <div className="px-3 md:px-4 lg:px-4 w-full">
            <main>{children}</main>
          </div>
        </div>
      </div>
      <span className={` ${isLogin ? "md:hidden" : ""}`}>
        <div className="mx-3">
          <SupportButton className="mt-2 w-full md:mx-0" />
        </div>

        <footer
          className={`flex items-center justify-between ${isLogin ? "mb-20 md:mb-0" : ""} px-3`}
        >
          <Contacts />
          <Version />
        </footer>
      </span>
      {isLogin ? (
        <div className="bg-content1 bg-opacity-50 backdrop-blur-xl fixed inset-x-0 bottom-0 z-50 shadow-medium md:hidden">
          <Menu variant="mobile" />
        </div>
      ) : null}
    </div>
  );
}
