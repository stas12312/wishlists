"use client";

import { Switch } from "@heroui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BrowserPushSettings } from "./BrowserPushSettings";

import {
  getNotificationPreferences,
  setNotificationPreference,
} from "@/lib/client-requests/notification";
import {
  NotificationChannel,
  NotificationKind,
  NotificationPreference,
  NotificationPreferenceKind,
  notificationChannels as channels,
} from "@/lib/models/notification";
import { SettingsLinksStore } from "@/store/settingsLinksStore";

const friendKinds = [
  "friend.requested",
  "friend.accepted",
  "friend.declined",
] as const;

const preferenceRows = [
  {
    kind: "support.reply",
    label: "Ответы поддержки",
    kinds: ["support.reply"],
  },
  {
    kind: "wish.questions",
    label: "Вопросы и ответы о желаниях",
    kinds: ["question.created", "question.answered"],
  },
  { kind: "friend.requests", label: "Заявки в друзья", kinds: friendKinds },
] as const;

export const SettingNotifications = observer(function SettingNotifications({
  linksStore,
  onPushChange,
}: {
  linksStore?: SettingsLinksStore;
  onPushChange?: () => void;
}) {
  const [preferences, setPreferences] = useState<
    Partial<Record<NotificationKind, NotificationPreference[]>>
  >({});
  const [pushRevision, setPushRevision] = useState(0);
  const [pendingPreference, setPendingPreference] = useState<{
    kind: NotificationPreferenceKind;
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
  }, [telegramLinked, pushRevision]);

  async function change(
    kind: NotificationPreferenceKind,
    kinds: readonly NotificationKind[],
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
      setPreferences((previous) => {
        const updated = { ...previous };
        for (const eventKind of kinds) {
          updated[eventKind] = previous[eventKind]?.map((item) =>
            item.channel === channel ? { ...item, enabled } : item,
          );
        }
        return updated;
      });
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

  const pushConfigured = preferences["support.reply"]?.some(
    ({ channel }) => channel === "web_push",
  );
  const visibleChannels = channels.filter(
    ({ id }) => id !== "web_push" || pushConfigured,
  );

  return (
    <div className="@container flex min-w-0 flex-col gap-3">
      <div className="rounded-3xl border border-border/50 bg-surface shadow-sm">
        <table
          aria-label="Уведомления"
          className="block w-full border-collapse text-sm @min-[32rem]:table"
        >
          <thead className="hidden border-b border-border/50 text-muted @min-[32rem]:table-header-group">
            <tr>
              <th
                className="px-3 py-3 text-left font-medium sm:px-6"
                scope="col"
              >
                Тип уведомления
              </th>
              {visibleChannels.map(({ id, label }) => (
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
          <tbody className="block text-foreground @min-[32rem]:table-row-group">
            {preferenceRows.map(({ kind, label, kinds }) => (
              <tr
                key={kind}
                className="grid gap-x-1 gap-y-2 border-b border-border/50 px-3 py-3 last:border-b-0 @min-[32rem]:table-row"
                style={{
                  gridTemplateColumns: `repeat(${visibleChannels.length}, minmax(0, 1fr))`,
                }}
              >
                <th
                  className="col-span-full text-left font-medium @min-[32rem]:px-6 @min-[32rem]:py-4"
                  scope="row"
                >
                  {label}
                </th>
                {visibleChannels.map(({ id, label: channelLabel }) => {
                  const channelPreferences = kinds.map((eventKind) =>
                    preferences[eventKind]?.find(
                      ({ channel }) => channel === id,
                    ),
                  );
                  const loaded = channelPreferences.every(Boolean);
                  const available = channelPreferences.every(
                    (item) => item?.available,
                  );
                  const enabled = channelPreferences.some(
                    (item) => item?.enabled,
                  );
                  return (
                    <td
                      key={id}
                      className="align-middle @min-[32rem]:px-2 @min-[32rem]:py-4"
                    >
                      <span
                        aria-hidden="true"
                        className="block text-center text-xs text-muted @min-[32rem]:hidden"
                      >
                        {channelLabel}
                      </span>
                      <div className="flex min-h-6 items-center justify-center">
                        {loaded ? (
                          <Switch
                            aria-label={`${label} · ${channelLabel}`}
                            isDisabled={!available}
                            isReadOnly={pendingPreference !== null}
                            isSelected={
                              available &&
                              (pendingPreference?.kind === kind &&
                              pendingPreference.channel === id
                                ? pendingPreference.enabled
                                : enabled)
                            }
                            onChange={(value) =>
                              void change(kind, kinds, id, value)
                            }
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
        <p className="text-sm text-muted">
          <Link className="text-accent underline" href="/settings#email">
            Добавьте email
          </Link>
          , чтобы получать уведомления на почту.
        </p>
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
      {pushConfigured && (
        <BrowserPushSettings
          onChange={() => {
            setPushRevision((value) => value + 1);
            onPushChange?.();
          }}
        />
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
});
