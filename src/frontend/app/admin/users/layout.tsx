import { ReactNode } from "react";

import { AdminUsersProvider } from "@/components/admin/AdminUsersProvider";

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminUsersProvider>{children}</AdminUsersProvider>;
}
