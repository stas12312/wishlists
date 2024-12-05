import Login from "@/components/login";
import Menu from "@/components/menu";
import { ThemeSwitcher } from "@/components/themeSwitcher";
import { UserItem } from "@/components/user";
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
              <div>
                <Menu />
              </div>
            </div>
          </>
        )}
        <div
          className={`col-span-full ${isLogin ? "md:col-span-9 lg:col-span-10" : null} px-1 md:px-4 lg:px-4`}
        >
          <main>{children}</main>
        </div>
      </div>
      <footer className="sticky top-[100vh] p-2 grid grid-cols-12">
        <div className="text-default-500 text-tiny text-center col-span-full md:col-span-3 lg:col-span-2 cursor-default">
          <a
            href="https://github.com/stas12312/wishlists"
            target="_blank"
            className="cursor-default hover:text-default-900"
          >
            <span>{`v${process.env.VERSION ?? process.env.npm_package_version}`}</span>
            <br />
            <span>{process.env.BUILD_TIME} </span>
          </a>
        </div>
      </footer>
    </div>
  );
}
