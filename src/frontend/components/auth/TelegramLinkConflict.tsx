"use client";

import { Alert, Button } from "@heroui/react";
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

  const hasEmail = Boolean(store.accountEmail.trim());
  const canUnlink = hasEmail && !store.targetHasTelegram;
  const openSettings = !canUnlink;

  return (
    <>
      <h2 className="text-lg font-semibold">
        Этот Telegram уже привязан к другому аккаунту
      </h2>
      <TelegramAccountCard store={store} />
      {store.targetHasTelegram ? (
        <p>
          К аккаунту, который вы хотите привязать, уже подключён другой
          Telegram.
        </p>
      ) : hasEmail ? (
        <p>Для продолжения его необходимо отвязать.</p>
      ) : (
        <Alert className="bg-warning-soft" status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              Отвязать аккаунт можно только после добавления email.
            </Alert.Title>
            <Alert.Description>
              Войдите в этот аккаунт и добавьте email в настройках, чтобы
              отвязать его, или удалите профиль.
            </Alert.Description>
          </Alert.Content>
        </Alert>
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
          onPress={() => void store.loginLinkedAccount(openSettings)}
        >
          {openSettings ? "Перейти в настройки" : "Войти"}
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
