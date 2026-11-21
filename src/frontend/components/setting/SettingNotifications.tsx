"use client";

import { Switch } from "@heroui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  getNotificationPreferences,
  setNotificationPreference,
} from "@/lib/client-requests/notification";
import {
  NotificationChannel,
  NotificationPreference,
} from "@/lib/models/notification";
import { SettingsLinksStore } from "@/store/settingsLinksStore";

const channels = [
  { id: "email", label: "Email", switchLabel: "Ответы поддержки по Email" },
  {
    id: "telegram",
    label: "Telegram",
    switchLabel: "Ответы поддержки в Telegram",
  },
] as const;

export const SettingNotifications = observer(function SettingNotifications({
  linksStore,
}: {
  linksStore?: SettingsLinksStore;
}) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loadRequest = useRef<AbortController>(null);
  const isSaving = useRef(false);
  const telegramLinked = linksStore?.info?.links.some(
    ({ provider }) => provider === "telegram",
  );

  useEffect(() => {
    async function load() {
      if (isSaving.current) return;
      loadRequest.current?.abort();
      const { signal } = (loadRequest.current = new AbortController());
      try {
        const result = await getNotificationPreferences(signal);
        if (!signal.aborted) {
          setPreferences(result);
          setError("");
        }
      } catch {
        if (!signal.aborted)
          setError("Не удалось загрузить настройки уведомлений");
      }
    }
    void load();
    window.addEventListener("focus", load);
    return () => {
      loadRequest.current?.abort();
      window.removeEventListener("focus", load);
    };
  }, [telegramLinked]);

  async function change(channel: NotificationChannel, enabled: boolean) {
    if (isSaving.current) return;
    isSaving.current = true;
    loadRequest.current?.abort();
    setSaving(true);
    setError("");
    try {
      await setNotificationPreference(channel, enabled);
      setPreferences((previous) =>
        previous.map((item) =>
          item.channel === channel ? { ...item, enabled } : item,
        ),
      );
    } catch {
      setError("Не удалось сохранить настройки уведомлений");
    } finally {
      isSaving.current = false;
      setSaving(false);
    }
  }

  const email = preferences.find(({ channel }) => channel === "email");
  const telegram = preferences.find(({ channel }) => channel === "telegram");

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-3xl border border-border/50 bg-surface shadow-sm">
        <table
          aria-label="Уведомления"
          className="w-full border-collapse text-sm"
        >
          <thead className="border-b border-border/50 text-muted">
            <tr>
              <th
                className="px-3 py-3 text-left font-medium sm:px-6"
                scope="col"
              >
                Тип уведомления
              </th>
              {channels.map(({ id, label }) => (
                <th
                  key={id}
                  className="w-20 px-2 py-3 text-center font-medium sm:w-36"
                  scope="col"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr>
              <th
                className="px-3 py-4 text-left font-medium sm:px-6"
                scope="row"
              >
                Ответы поддержки
              </th>
              {channels.map(({ id, switchLabel }) => {
                const preference = id === "email" ? email : telegram;
                return (
                  <td key={id} className="px-2 py-4 align-middle">
                    <div className="flex min-h-6 items-center justify-center">
                      {preference ? (
                        <Switch
                          aria-label={switchLabel}
                          isDisabled={
                            saving ||
                            (!preference.available && !preference.enabled)
                          }
                          isSelected={preference.enabled}
                          onChange={(value) => void change(id, value)}
                        >
                          <Switch.Content>
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                          </Switch.Content>
                        </Switch>
                      ) : (
                        <span className="text-muted" role="status">
                          <span aria-hidden>—</span>
                          {!error && <span className="sr-only">Загрузка…</span>}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {email && !email.available && (
        <p className="text-sm text-muted">Добавьте адрес в настройках Email</p>
      )}
      {telegram && !telegram.available && (
        <p className="text-sm text-muted">
          {telegram.linked ? (
            "Уведомления в Telegram временно недоступны"
          ) : (
            <>
              <Link
                className="text-accent underline"
                href="/settings#login-methods"
              >
                Подключите Telegram
              </Link>
              , чтобы получать в нем уведомления.
            </>
          )}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
});
