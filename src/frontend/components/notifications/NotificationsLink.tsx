"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { MdNotificationsNone } from "react-icons/md";

import { useNotificationRefresh } from "./useNotificationRefresh";

import { getUnreadNotifications } from "@/lib/client-requests/notification";

export function NotificationsLink() {
  const [count, setCount] = useState(0);
  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const unread = await getUnreadNotifications(signal);
      if (!signal.aborted) setCount(unread);
    } catch {
      // Счётчик обновится при следующем событии или возвращении на вкладку.
    }
  }, []);
  useNotificationRefresh(load);

  return (
    <Link
      aria-label={
        count > 0 ? `Уведомления. Непрочитанных: ${count}` : "Уведомления"
      }
      className="relative flex size-10 shrink-0 items-center justify-center self-center rounded-full hover:bg-default"
      href="/notifications"
      title="Уведомления"
    >
      <MdNotificationsNone aria-hidden className="size-6" />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-accent-foreground"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
