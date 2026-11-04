"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import PageHeader from "@/components/PageHeader";
import { AdminUsersStore } from "@/store/adminUsersStore";

export default observer(function AdminUsersPage() {
  const [store] = useState(() => new AdminUsersStore());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { loading, hasMore, error } = store;
  useEffect(() => {
    void store.loadUsers();
    return () => store.cancelSearch();
  }, [store]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loading || !hasMore || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void store.loadUsers(true);
      },
      { rootMargin: "300px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [store, loading, hasMore, error]);

  return (
    <>
      <PageHeader title="Пользователи" />
      <div className="flex flex-col gap-4">
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void store.loadUsers();
          }}
        >
          <TextField
            className="min-w-0 grow"
            value={store.search}
            onChange={(value) => store.setSearch(value)}
          >
            <Label>Поиск пользователя</Label>
            <Input placeholder="ID, имя, username или email" />
          </TextField>
          <Button isPending={store.loading} type="submit">
            Найти
          </Button>
        </form>
        {store.error && (
          <p className="text-danger" role="alert">
            {store.error}
          </p>
        )}
        <div aria-busy={store.loading} className="flex flex-col gap-2">
          {store.users.map((user) => (
            <Link
              key={user.id}
              className="rounded-xl bg-surface p-4 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-accent"
              href={`/admin/users/${user.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold break-all">
                  {user.name}{" "}
                  <span className="text-muted font-normal">#{user.id}</span>
                </span>
                <span className="text-sm text-muted">
                  {user.is_admin ? "Администратор · " : ""}
                  {user.is_active ? "Активен" : "Не активирован"}
                </span>
              </div>
              <p className="text-sm text-muted break-all">
                @{user.username} · {user.email || "Email не указан"}
              </p>
            </Link>
          ))}
          {store.loading && <p role="status">Загрузка пользователей…</p>}
          {!store.loading && !store.error && !store.users.length && (
            <p className="text-muted">Пользователи не найдены</p>
          )}
        </div>
        <div ref={loadMoreRef} aria-hidden="true" className="h-px" />
        {store.error && (
          <Button
            isPending={store.loading}
            variant="secondary"
            onPress={() => void store.loadUsers(store.hasMore)}
          >
            Повторить загрузку
          </Button>
        )}
      </div>
    </>
  );
});
