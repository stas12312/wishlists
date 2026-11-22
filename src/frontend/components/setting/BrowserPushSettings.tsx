"use client";

import { useEffect, useState } from "react";

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

export function BrowserPushSettings({ onChange }: { onChange: () => void }) {
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
      onChange();
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

  return (
    <div className="flex flex-col items-start gap-2 text-sm">
      {registration && (
        <button
          className="text-accent underline disabled:opacity-50"
          disabled={pending}
          type="button"
          onClick={() => void change()}
        >
          {linked
            ? "Отключить уведомления на этом устройстве"
            : "Включить уведомления на этом устройстве"}
        </button>
      )}
      {message && (
        <p className="text-muted" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
