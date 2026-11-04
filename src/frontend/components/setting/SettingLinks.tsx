"use client";

import { Button } from "@heroui/react";
import { observer } from "mobx-react-lite";

import ConfirmationModal from "@/components/ConfirmationModal";
import { Yandex } from "@/components/logo/YandexLogo";
import { SettingsLinksStore } from "@/store/settingsLinksStore";

const providers = [
  { id: "yandex", name: "Яндекс" },
  { id: "telegram", name: "Telegram" },
];

export const SettingLinks = observer(function SettingLinks({
  store,
  service,
}: {
  store: SettingsLinksStore;
  service: "yandex" | "telegram";
}) {
  return (
    <div className="flex flex-col gap-3">
      {store.loading && <p role="status">Загрузка привязок…</p>}
      {store.error && (
        <p className="text-danger" role="alert">
          {store.error}
        </p>
      )}
      {!store.loading && !store.info && (
        <Button variant="secondary" onPress={() => void store.load()}>
          Повторить
        </Button>
      )}
      {store.info && (
        <>
          {providers
            .filter((provider) => provider.id === service)
            .map((provider) => {
              const connectionUrl = store.info!.providers.find(
                (item) => item.name === provider.id,
              )?.url;
              const linked = store.info!.links.some(
                (link) => link.provider === provider.id,
              );

              return (
                <div
                  key={provider.id}
                  className={
                    service === "telegram"
                      ? "flex flex-col items-start gap-4 text-left md:flex-row md:items-center md:justify-between"
                      : "flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-3 text-left"
                  }
                >
                  <div>
                    {service === "telegram" ? (
                      <p className="max-w-xl text-sm text-muted">
                        {linked
                          ? "Аккаунт подключён к Telegram. Открывайте свои вишлисты в мини-приложении."
                          : "Подключите аккаунт, чтобы открывать свои вишлисты в мини-приложении Telegram. Для подключения перейдите в Telegram и войдите в свой аккаунт."}
                      </p>
                    ) : (
                      <p
                        className={`flex items-center gap-2 font-semibold${linked ? "" : " text-muted"}`}
                      >
                        <span aria-hidden="true">
                          <Yandex className="size-6 rounded-full" />
                        </span>
                        {provider.name}
                      </p>
                    )}
                  </div>
                  {linked ? (
                    <Button
                      isDisabled={!store.info?.has_email || store.deleting}
                      variant="danger-soft"
                      onPress={() => store.selectProvider(provider.id)}
                    >
                      Удалить привязку
                    </Button>
                  ) : (
                    <Button
                      isDisabled={store.deleting || !connectionUrl}
                      variant="secondary"
                      onPress={() => {
                        if (!connectionUrl) return;
                        if (provider.id === "yandex") {
                          localStorage.setItem("path", "/settings");
                          window.open(
                            connectionUrl,
                            "YANDEX",
                            "status=no,location=no,toolbar=no,menubar=no,titlebar=no",
                          );
                        } else {
                          window.location.assign(
                            window.Telegram?.WebApp.initData
                              ? "/miniapp/telegram?link=1"
                              : connectionUrl!,
                          );
                        }
                      }}
                    >
                      Подключить
                    </Button>
                  )}
                </div>
              );
            })}
          {!store.info.has_email && (
            <p className="text-sm text-muted">
              Удалить привязки можно только при наличии email в аккаунте.
            </p>
          )}
        </>
      )}
      <ConfirmationModal
        confirmDisabled={store.deleting}
        confirmName="Удалить привязку"
        declineName="Отмена"
        isOpen={store.pendingProvider === service}
        message={`Удалить привязку ${providers.find((provider) => provider.id === store.pendingProvider)?.name ?? ""}? Вход через этот сервис больше не будет доступен. Для входа по email можно использовать пароль или восстановить его.`}
        title="Удалить привязку?"
        onConfirm={() => store.remove()}
        onDecline={() => store.selectProvider(null)}
      />
    </div>
  );
});
