"use client";

import { Avatar, Button } from "@heroui/react";
import { observer } from "mobx-react-lite";

import { TelegramStore } from "@/store/telegramStore";

export const TelegramLinkConfirmation = observer(
  function TelegramLinkConfirmation({ store }: { store: TelegramStore }) {
    if (store.status !== "link") return null;

    return (
      <>
        <div className="flex w-full items-center gap-3 rounded-3xl bg-default p-4 text-left">
          <Avatar className="size-12 shrink-0">
            <Avatar.Image
              alt=""
              className="object-cover"
              src={store.accountImage}
            />
            <Avatar.Fallback>{store.accountName[0] || "?"}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2
              className="truncate text-lg font-semibold"
              title={store.accountName}
            >
              {store.accountName}
            </h2>
            {store.accountEmail && (
              <p
                className="truncate text-sm text-muted"
                title={store.accountEmail}
              >
                {store.accountEmail}
              </p>
            )}
          </div>
        </div>
        <p>
          Привяжите Telegram к этому аккаунту, чтобы в следующий раз входить
          автоматически.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            isDisabled={store.busy}
            variant="secondary"
            onPress={() => void store.cancelLink()}
          >
            Отмена
          </Button>
          <Button isPending={store.busy} onPress={() => void store.link()}>
            Привязать
          </Button>
        </div>
      </>
    );
  },
);
