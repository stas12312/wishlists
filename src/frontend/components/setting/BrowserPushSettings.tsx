"use client";

import { Alert, Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { MdNotificationsActive, MdNotificationsOff } from "react-icons/md";

import {
  browserPushWorker,
  disconnectBrowserPush,
  supportsBrowserPush,
} from "@/lib/browserPush";
import {
  getWebPushKey,
  isWebPushLinked,
  saveWebPushSubscription,
} from "@/lib/client-requests/notification";

export function BrowserPushSettings({
  onChange,
  prompt = false,
}: {
  onChange?: () => void;
  prompt?: boolean;
}) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const [key, setKey] = useState("");
  const [linked, setLinked] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const request = new AbortController();
    const { signal } = request;

    async function load() {
      if (!supportsBrowserPush()) {
        setMessage(
          "Для уведомлений нужен поддерживаемый браузер. На iPhone и iPad откройте MyWishlists с экрана «Домой».",
        );
        return;
      }
      try {
        const publicKey = await getWebPushKey(signal);
        if (!publicKey || signal.aborted) return;
        const worker =
          await navigator.serviceWorker.register(browserPushWorker);
        const ready = worker.active
          ? worker
          : await navigator.serviceWorker.ready;
        const subscription = await ready.pushManager.getSubscription();
        const subscribed = subscription
          ? await isWebPushLinked(subscription.endpoint, signal)
          : false;
        if (signal.aborted) return;

        setRegistration(ready);
        setKey(publicKey);
        setLinked(subscribed);
      } catch {
        if (!signal.aborted)
          setMessage("Не удалось загрузить подписку браузера");
      }
    }

    void load();
    return () => request.abort();
  }, []);

  async function change() {
    if (!registration || pending) return;
    setPending(true);
    setMessage("");
    try {
      if (linked) {
        await disconnectBrowserPush();
        setLinked(false);
      } else {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
        try {
          await saveWebPushSubscription(subscription);
        } catch (error) {
          await subscription.unsubscribe();
          throw error;
        }
        setLinked(true);
      }
      onChange?.();
    } catch {
      setMessage(
        !linked && Notification.permission === "denied"
          ? "Разрешите уведомления для MyWishlists в настройках браузера."
          : "Не удалось изменить подписку на этом устройстве. Попробуйте ещё раз.",
      );
    } finally {
      setPending(false);
    }
  }

  if (prompt) {
    if (!registration || linked) return null;

    return (
      <Alert status="accent">
        <Alert.Indicator />
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Alert.Content className="min-w-0">
            <Alert.Title>Уведомления на этом устройстве</Alert.Title>
            <Alert.Description>
              Получайте уведомления, даже когда сайт закрыт.
            </Alert.Description>
            {message && (
              <p className="text-muted" role="status">
                {message}
              </p>
            )}
          </Alert.Content>
          <Button
            className="shrink-0 self-start sm:self-center"
            isPending={pending}
            size="sm"
            variant="primary"
            onPress={() => void change()}
          >
            {pending ? "Включаем…" : "Включить уведомления"}
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 text-sm">
      {registration && (
        <Button
          className="self-center"
          isPending={pending}
          size="sm"
          variant={linked ? "danger-soft" : "primary"}
          onPress={() => void change()}
        >
          {linked ? (
            <MdNotificationsOff aria-hidden="true" />
          ) : (
            <MdNotificationsActive aria-hidden="true" />
          )}
          {linked
            ? "Отключить уведомления на этом устройстве"
            : "Включить уведомления на этом устройстве"}
        </Button>
      )}
      {message && (
        <p className="text-muted" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
