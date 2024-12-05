import Login from "@/components/login";
import Menu from "@/components/menu";
import { ThemeSwitcher } from "@/components/themeSwitcher";
import { UserItem } from "@/components/user";
import Version from "@/components/version";
import { cookies } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLogin = cookieStore.has("access_token");
  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-12 gap-1 pb-4">
        {!isLogin ? (
          <div className="flex col-span-full">
            <div className="ml-auto mr-6 py-2 flex flex-row gap-2">
              <ThemeSwitcher />
              <Login />
            </div>
          </div>
        ) : (
          <>
            <div className="flex col-span-full justify-end">
              <div className="ml-auto mr-6 pt-3 px-10 flex flex-row gap-2">
                <ThemeSwitcher />
                <UserItem />
              </div>
            </div>
            <div className="col-span-full md:col-span-3 lg:col-span-2 flex-col">
              <div className="sticky top-10">
                <Menu />
                <span className="hidden md:block">
                  <footer className="p-2">
                    <Version />
                  </footer>
                </span>
              </div>
            </div>
          </>
        )}
        <div
          className={`col-span-full ${isLogin ? "md:col-span-9 lg:col-span-10" : null} px-1 md:px-4 lg:px-4`}
        >
          <main>{children}</main>
        </div>
        <span className={` ${isLogin ? "md:hidden" : null} col-span-full`}>
          <footer>
            <Version />
          </footer>
        </span>
      </div>
    </div>
  );
}
