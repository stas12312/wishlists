import { notFound } from "next/navigation";
import { ReactNode } from "react";

import { checkIsAdmin } from "@/lib/server-requests/admin";
import { AdminMenu } from "@/components/admin/menu";
import { Logo } from "@/components/logo";
import { ThemeSwitcher } from "@/components/themeSwitcher";
import { UserItem } from "@/components/user";

export default async function Layout({ children }: { children: ReactNode }) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw notFound();
  }
  return (
    <>
      <header className="flex z-10">
        <div className="w-60 shrink-0 hidden  p-4 items-center md:flex justify-center">
          <Logo />
        </div>
        <div className="p-4 gap-4 w-full flex col-span-full justify-between md:justify-end">
          <ThemeSwitcher />
          <UserItem />
        </div>
      </header>
      <main>
        <div className="flex">
          <div className="w-75 px-4">
            <AdminMenu />
          </div>
          <div className="w-full">{children}</div>
        </div>
      </main>
    </>
  );
}
