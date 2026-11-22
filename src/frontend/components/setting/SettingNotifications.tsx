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
  NotificationKind,
  NotificationPreference,
  notificationChannels as channels,
  notificationTypes,
} from "@/lib/models/notification";
import { SettingsLinksStore } from "@/store/settingsLinksStore";

export const SettingNotifications = observer(function SettingNotifications({
  linksStore,
}: {
  linksStore?: SettingsLinksStore;
}) {
  const [preferences, setPreferences] = useState<
    Partial<Record<NotificationKind, NotificationPreference[]>>
  >({});
  const [pendingPreference, setPendingPreference] = useState<{
    kind: NotificationKind;
    channel: NotificationChannel;
    enabled: boolean;
  } | null>(null);
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

  async function change(
    kind: NotificationKind,
    channel: NotificationChannel,
    enabled: boolean,
  ) {
    if (isSaving.current) return;
    isSaving.current = true;
    loadRequest.current?.abort();
    setPendingPreference({ kind, channel, enabled });
    setError("");
    try {
      await setNotificationPreference(kind, channel, enabled);
      setPreferences((previous) => ({
        ...previous,
        [kind]: previous[kind]?.map((item) =>
          item.channel === channel ? { ...item, enabled } : item,
        ),
      }));
    } catch {
      setError("Не удалось сохранить настройки уведомлений");
    } finally {
      isSaving.current = false;
      setPendingPreference(null);
    }
  }

  const email = preferences["support.reply"]?.find(
    ({ channel }) => channel === "email",
  );
  const telegram = preferences["support.reply"]?.find(
    ({ channel }) => channel === "telegram",
  );

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
            {notificationTypes.map(({ kind, label }) => (
              <tr
                key={kind}
                className="border-b border-border/50 last:border-b-0"
              >
                <th
                  className="px-3 py-4 text-left font-medium sm:px-6"
                  scope="row"
                >
                  {label}
                </th>
                {channels.map(({ id, label: channelLabel }) => {
                  const preference = preferences[kind]?.find(
                    ({ channel }) => channel === id,
                  );
                  const isTelegramUnavailable =
                    id === "telegram" && preference?.available === false;
                  return (
                    <td key={id} className="px-2 py-4 align-middle">
                      <div className="flex min-h-6 items-center justify-center">
                        {preference ? (
                          <Switch
                            aria-label={`${label} · ${channelLabel}`}
                            isDisabled={
                              isTelegramUnavailable ||
                              (!preference.available && !preference.enabled)
                            }
                            isReadOnly={pendingPreference !== null}
                            isSelected={
                              !isTelegramUnavailable &&
                              (pendingPreference?.kind === kind &&
                              pendingPreference.channel === id
                                ? pendingPreference.enabled
                                : preference.enabled)
                            }
                            onChange={(value) => void change(kind, id, value)}
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
                            {!error && (
                              <span className="sr-only">Загрузка…</span>
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
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
