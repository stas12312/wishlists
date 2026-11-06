"use client";

import { Button, Tabs } from "@heroui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";

import { AdminUserWishlists } from "./AdminUserWishlists";

import ConfirmationModal from "@/components/ConfirmationModal";
import { CustomBreadcrumbs } from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import { Yandex } from "@/components/logo/YandexLogo";
import { AdminUsersStore } from "@/store/adminUsersStore";

const providerName = (provider: string) =>
  ({ yandex: "Яндекс", telegram: "Telegram" })[provider] ?? provider;

export const AdminUserDetail = observer(function AdminUserDetail({
  id,
}: {
  id: number;
}) {
  const [store] = useState(() => new AdminUsersStore());
  useEffect(() => {
    void store.loadUser(id);
  }, [store, id]);
  const user = store.user;
  const lastLogin = user && !user.has_password && user.links.length === 1;

  return (
    <>
      <PageHeader>
        <CustomBreadcrumbs
          items={[
            { title: "Пользователи", href: "/admin/users" },
            {
              title: user?.name ?? "",
              href: `/admin/users/${id}`,
            },
          ]}
        />
      </PageHeader>
      <div className="flex flex-col gap-4">
        {store.error && (
          <p className="text-danger" role="alert">
            {store.error}
          </p>
        )}
        {store.error && !store.loading && !user && (
          <Button variant="secondary" onPress={() => void store.loadUser(id)}>
            Повторить
          </Button>
        )}
        {user && (
          <>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-xl bg-surface p-4 text-sm">
              <dt className="text-muted">ID</dt>
              <dd>{user.id}</dd>
              <dt className="text-muted">Профиль</dt>
              <dd className="break-all">
                <Link className="text-accent" href={`/users/${user.username}`}>
                  @{user.username}
                </Link>
              </dd>
              <dt className="text-muted">Email</dt>
              <dd className="break-all">{user.email || "Не указан"}</dd>
              <dt className="text-muted">Статус</dt>
              <dd>{user.is_active ? "Активен" : "Не активирован"}</dd>
              <dt className="text-muted">Роль</dt>
              <dd>{user.is_admin ? "Администратор" : "Пользователь"}</dd>
              <dt className="text-muted">Регистрация</dt>
              <dd>{new Date(user.created_at).toLocaleString("ru-RU")}</dd>
              <dt className="text-muted">Пароль</dt>
              <dd>{user.has_password ? "Установлен" : "Не установлен"}</dd>
            </dl>
            <Tabs key={id} defaultSelectedKey="wishlists">
              <Tabs.ListContainer>
                <Tabs.List aria-label="Данные пользователя">
                  <Tabs.Tab id="wishlists">
                    Вишлисты
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab
                    className="px-2 whitespace-nowrap sm:px-4"
                    id="login-links"
                  >
                    Привязки для входа
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel
                shouldForceMount
                className="mt-4 inert:hidden"
                id="wishlists"
              >
                <AdminUserWishlists id={id} />
              </Tabs.Panel>
              <Tabs.Panel className="mt-4" id="login-links">
                <div className="flex flex-col gap-4">
                  {!user.links.length && (
                    <p className="text-muted">Привязок нет</p>
                  )}
                  {user.links.map((link) => (
                    <div
                      key={`${link.provider}:${link.oauth_user_id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold">
                          <span aria-hidden="true" className="shrink-0">
                            {link.provider === "yandex" && (
                              <Yandex className="size-6 rounded-full" />
                            )}
                            {link.provider === "telegram" && (
                              <FaTelegramPlane className="size-6 text-[#229ED9]" />
                            )}
                          </span>
                          {providerName(link.provider)}
                        </p>
                        <p className="text-sm text-muted break-all">
                          ID: {link.oauth_user_id}
                        </p>
                      </div>
                      {["yandex", "telegram"].includes(link.provider) && (
                        <Button
                          isDisabled={store.deleting}
                          variant="danger-soft"
                          onPress={() => store.selectLink(link)}
                        >
                          Удалить привязку
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </div>
      <ConfirmationModal
        confirmByText
        confirmDisabled={store.deleting}
        confirmLabel={`Для подтверждения введите ID привязки: ${store.pendingLink?.oauth_user_id ?? ""}`}
        confirmName="Удалить привязку"
        confirmText={store.pendingLink?.oauth_user_id}
        declineName="Отмена"
        isOpen={!!store.pendingLink}
        message={
          <>
            <p>
              Удалить привязку {providerName(store.pendingLink?.provider ?? "")}{" "}
              (ID: {store.pendingLink?.oauth_user_id}) у пользователя{" "}
              {user?.name} (#{user?.id})? Вход через этот аккаунт больше не
              будет доступен.
            </p>
            {lastLogin && (
              <p className="mt-2 text-danger">
                Это последний способ входа: пароль не установлен. После удаления
                пользователь потеряет доступ к аккаунту.
              </p>
            )}
          </>
        }
        title="Удалить привязку?"
        onConfirm={() => store.deleteLink()}
        onDecline={() => store.selectLink(null)}
      />
    </>
  );
});
