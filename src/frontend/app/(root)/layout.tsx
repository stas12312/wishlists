import Login from "@/components/login";
import Menu from "@/components/menu";
import { UserItem } from "@/components/user";
import { observer } from "mobx-react-lite";
import { cookies } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLogin = cookieStore.has("access_token");
  return (
    <div>
      {!isLogin ? (
        <div className="grid grid-cols-12 gap-1">
          <div className="flex col-span-full">
            <div className="ml-auto mr-6 py-2">
              <Login />
            </div>
          </div>
          <div className="col-span-full">{children}</div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-1">
          <div className="flex col-span-full">
            <div className="ml-auto mr-6 pt-3 px-10">
              <UserItem />
            </div>
          </div>
          <div className="col-span-full md:col-span-3 lg:col-span-2 flex-col">
            <div>
              <Menu />
            </div>
          </div>

          <div className="col-span-full md:col-span-9 lg:col-span-10 px-10">
            <main>{children}</main>
            <footer className="w-full flex items-center justify-center py-3" />
          </div>
        </div>
      )}
    </div>
  );
}

