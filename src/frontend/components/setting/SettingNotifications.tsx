"use client";

import { Switch } from "@heroui/react";
import { useEffect, useState } from "react";

import {
  getEmailNotificationPreference,
  setEmailNotificationPreference,
} from "@/lib/client-requests/notification";
import { NotificationPreference } from "@/lib/models/notification";

export function SettingNotifications() {
  const [preference, setPreference] = useState<NotificationPreference>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let request: AbortController;
    async function load() {
      request?.abort();
      request = new AbortController();
      const signal = request.signal;
      try {
        const result = await getEmailNotificationPreference(signal);
        if (!result) throw new Error("Настройка почты отсутствует");
        if (!signal.aborted) setPreference(result);
      } catch {
        if (!signal.aborted)
          setError("Не удалось загрузить настройки уведомлений");
      }
    }
    void load();
    window.addEventListener("focus", load);
    return () => {
      request.abort();
      window.removeEventListener("focus", load);
    };
  }, []);

  async function change(enabled: boolean) {
    setSaving(true);
    setError("");
    try {
      await setEmailNotificationPreference(enabled);
      setPreference((previous) => previous && { ...previous, enabled });
    } catch {
      setError("Не удалось сохранить настройки уведомлений");
    } finally {
      setSaving(false);
    }
  }

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
                className="px-5 py-3 text-left font-medium sm:px-6"
                scope="col"
              >
                Тип уведомления
              </th>
              <th
                className="w-24 px-4 py-3 text-center font-medium sm:w-36"
                scope="col"
              >
                Email
              </th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr>
              <th
                className="px-5 py-4 text-left font-medium sm:px-6"
                scope="row"
              >
                Ответы поддержки
              </th>
              <td className="px-4 py-4 align-middle">
                <div className="flex min-h-6 items-center justify-center">
                  {preference ? (
                    <Switch
                      aria-label="Ответы поддержки по Email"
                      isDisabled={
                        saving || (!preference.available && !preference.enabled)
                      }
                      isSelected={preference.enabled}
                      onChange={(value) => void change(value)}
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
                      {!error ? (
                        <span className="sr-only">Загрузка…</span>
                      ) : null}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {preference && !preference.available ? (
        <p className="text-sm text-muted">Добавьте адрес в настройках Email</p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
