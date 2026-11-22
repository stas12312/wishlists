import { notFound } from "next/navigation";
import { ReactNode } from "react";

import { checkIsAdmin } from "@/lib/server-requests/admin";
import { AdminMenu } from "@/components/admin/AdminMenu";
import { Header } from "@/components/Header";
import { LeftPanel } from "@/components/left-panel/LeftPanel";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw notFound();
  }
  return (
    <div className="has-[[data-admin-telegram]]:flex has-[[data-admin-telegram]]:h-[calc(100dvh-var(--telegram-top-inset))] has-[[data-admin-telegram]]:flex-col has-[[data-admin-telegram]]:overflow-hidden">
      <Header isLogin />
      <main className="has-[[data-admin-telegram]]:flex has-[[data-admin-telegram]]:min-h-0 has-[[data-admin-telegram]]:flex-1 has-[[data-admin-telegram]]:flex-col">
        <div className="gap-1 flex mt-4 has-[[data-admin-telegram]]:mt-2 has-[[data-admin-telegram]]:min-h-0 has-[[data-admin-telegram]]:flex-1">
          <LeftPanel>
            <AdminMenu variant="desktop" />
          </LeftPanel>
          <div className="w-full min-w-0 px-3 md:px-0 md:pr-4 pb-28 md:pb-6 has-[[data-admin-telegram]]:flex has-[[data-admin-telegram]]:min-h-0 has-[[data-admin-telegram]]:flex-col">
            {children}
          </div>
        </div>
      </main>
      <AdminMenu variant="mobile" />
    </div>
  );
}
