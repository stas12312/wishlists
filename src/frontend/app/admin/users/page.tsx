"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { useAdminUsersStore } from "@/components/admin/AdminUsersProvider";

export default observer(function AdminUsersPage() {
  const store = useAdminUsersStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { loading, hasMore, error } = store;
  useEffect(() => {
    if (!store.hasLoadedUsers && !store.loading) void store.loadUsers();
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
          <Button type="submit">Найти</Button>
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
          {store.hasLoadedUsers &&
            !store.loading &&
            !store.error &&
            !store.users.length && (
              <EmptyState
                className="min-h-80"
                description="Попробуйте изменить запрос или проверить написание."
                title="Пользователи не найдены"
              />
            )}
        </div>
        <div ref={loadMoreRef} aria-hidden="true" className="h-px" />
        {store.error && (
          <Button
            isDisabled={store.loading}
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
