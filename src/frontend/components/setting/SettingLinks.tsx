"use client";

import { Button, Surface } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { FaTelegramPlane } from "react-icons/fa";

import { TelegramLinkButton } from "./TelegramLinkButton";

import ConfirmationModal from "@/components/ConfirmationModal";
import { Yandex } from "@/components/logo/YandexLogo";
import { SettingsLinksStore } from "@/store/settingsLinksStore";

const providers = [
  { id: "yandex", name: "Яндекс" },
  { id: "telegram", name: "Telegram" },
];

export const SettingLinks = observer(function SettingLinks({
  store,
}: {
  store: SettingsLinksStore;
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => {
              const connectionUrl = store.info!.providers.find(
                (item) => item.name === provider.id,
              )?.url;
              const linked = store.info!.links.some(
                (link) => link.provider === provider.id,
              );

              return (
                <Surface
                  key={provider.id}
                  className="flex min-w-0 flex-col items-center gap-5 rounded-3xl border border-border/50 p-6 text-center shadow-sm sm:p-8"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span aria-hidden="true">
                      {provider.id === "telegram" ? (
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#2AABEE] text-white">
                          <FaTelegramPlane className="size-8" />
                        </span>
                      ) : (
                        <Yandex className="size-14 rounded-2xl" />
                      )}
                    </span>
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                  </div>
                  <p className="max-w-xs text-sm leading-relaxed text-muted">
                    {provider.id === "telegram"
                      ? "Входите через Telegram и открывайте свои вишлисты в мини-приложении."
                      : "Входите в свой аккаунт с помощью Яндекс ID."}
                  </p>
                  <div className="mt-auto w-full max-w-xs pt-1">
                    {linked ? (
                      <Button
                        fullWidth
                        isDisabled={!store.info?.has_email || store.deleting}
                        variant="danger-soft"
                        onPress={() => store.selectProvider(provider.id)}
                      >
                        Удалить привязку
                      </Button>
                    ) : provider.id === "telegram" ? (
                      <TelegramLinkButton
                        disabled={store.deleting}
                        onLinked={store.setInfo}
                      />
                    ) : (
                      <Button
                        fullWidth
                        isDisabled={store.deleting || !connectionUrl}
                        variant="primary"
                        onPress={() => {
                          if (!connectionUrl) return;
                          localStorage.setItem("path", "/settings");
                          window.open(
                            connectionUrl,
                            "YANDEX",
                            "status=no,location=no,toolbar=no,menubar=no,titlebar=no",
                          );
                        }}
                      >
                        Подключить
                      </Button>
                    )}
                  </div>
                </Surface>
              );
            })}
          </div>
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
        isOpen={store.pendingProvider !== null}
        message={`Удалить привязку ${providers.find((provider) => provider.id === store.pendingProvider)?.name ?? ""}? Вход через этот сервис больше не будет доступен. Для входа по email можно использовать пароль или восстановить его.`}
        title="Удалить привязку?"
        onConfirm={() => store.remove()}
        onDecline={() => store.selectProvider(null)}
      />
    </div>
  );
});
