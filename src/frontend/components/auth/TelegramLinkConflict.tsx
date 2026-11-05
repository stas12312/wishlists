"use client";

import { Button } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { TelegramAccountCard } from "./TelegramLinkConfirmation";

import ConfirmationModal from "@/components/ConfirmationModal";
import { TelegramStore } from "@/store/telegramStore";

export const TelegramLinkConflict = observer(function TelegramLinkConflict({
  store,
}: {
  store: TelegramStore;
}) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  if (store.status !== "linkConflict") return null;

  const canUnlink = Boolean(store.accountEmail.trim());

  return (
    <>
      <h2 className="text-lg font-semibold">
        Этот Telegram уже привязан к другому аккаунту
      </h2>
      <TelegramAccountCard store={store} />
      {canUnlink ? (
        <p>Для продолжения его необходимо отвязать.</p>
      ) : (
        <p>
          Войдите в этот аккаунт и добавьте email в настройках или удалите
          профиль.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {canUnlink && (
          <Button
            fullWidth
            isDisabled={store.busy}
            variant="danger-soft"
            onPress={() => setIsConfirmationOpen(true)}
          >
            Отвязать аккаунт
          </Button>
        )}
        <Button
          fullWidth
          isPending={store.busy}
          onPress={() => void store.loginLinkedAccount(!canUnlink)}
        >
          {canUnlink ? "Войти" : "Перейти в настройки"}
        </Button>
      </div>
      <ConfirmationModal
        confirmDisabled={store.busy}
        confirmName="Отвязать аккаунт"
        declineName="Отмена"
        isOpen={isConfirmationOpen}
        message={`Telegram будет отвязан от аккаунта ${store.accountName}. Текущая сессия сохранится, и вы сможете продолжить привязку.`}
        title="Отвязать аккаунт?"
        onConfirm={async () => {
          await store.unlinkAndContinue();
          setIsConfirmationOpen(false);
        }}
        onDecline={() => setIsConfirmationOpen(false)}
      />
    </>
  );
});
