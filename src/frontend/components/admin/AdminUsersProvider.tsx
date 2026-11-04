"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import { AdminUsersStore } from "@/store/adminUsersStore";

const AdminUsersContext = createContext<AdminUsersStore | null>(null);

export function AdminUsersProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new AdminUsersStore());

  return (
    <AdminUsersContext.Provider value={store}>
      {children}
    </AdminUsersContext.Provider>
  );
}

export function useAdminUsersStore() {
  const store = useContext(AdminUsersContext);
  if (!store) throw new Error("AdminUsersProvider не найден");
  return store;
}
