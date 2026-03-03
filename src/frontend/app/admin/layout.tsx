import { notFound } from "next/navigation";
import { ReactNode } from "react";

import { checkIsAdmin } from "@/lib/server-requests/admin";
import { AdminMenu } from "@/components/admin/menu";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw notFound();
  }
  return (
    <>
      <Header isLogin />
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
