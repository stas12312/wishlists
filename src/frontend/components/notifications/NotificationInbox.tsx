"use client";

import { Button, Modal, toast } from "@heroui/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdDoneAll, MdNotificationsNone, MdSettings } from "react-icons/md";

import {
  refreshNotifications,
  useNotificationRefresh,
} from "./useNotificationRefresh";

import { EmptyState } from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { SettingNotifications } from "@/components/setting/SettingNotifications";
import {
  getUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markVisibleNotificationsRead,
} from "@/lib/client-requests/notification";
import { NotificationPage } from "@/lib/models/notification";

const notificationIcons: Record<string, string> = {
  "support.reply": "💬",
  "question.created": "❓",
  "question.answered": "💬",
  "friend.requested": "👋",
  "friend.accepted": "🤝",
  "friend.declined": "👤",
};

function showMarkReadError() {
  toast.danger("Не удалось отметить уведомления прочитанными");
}

export function NotificationInbox() {
  const [page, setPage] = useState<NotificationPage>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const marking = useRef(new Set<number>());
  const items = page?.items;

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const [firstPage, unread] = await Promise.all([
        listNotifications(0, signal),
        getUnreadNotifications(signal),
      ]);
      if (!signal.aborted) {
        setPage((previous) => {
          if (
            !firstPage.next ||
            !previous?.items.some((item) => item.id === firstPage.next)
          ) {
            return firstPage;
          }
          return {
            items: [
              ...firstPage.items,
              ...previous.items.filter((item) => item.id < firstPage.next),
            ],
            next: previous.next,
          };
        });
        setUnreadCount(unread);
        setError("");
      }
    } catch {
      if (!signal.aborted) setError("Не удалось загрузить уведомления");
    }
  }, []);
  useNotificationRefresh(load);

  const applyRead = useCallback((ids?: Set<number>) => {
    const readAt = new Date().toISOString();
    setPage(
      (previous) =>
        previous && {
          ...previous,
          items: previous.items.map((item) =>
            !item.read_at && (!ids || ids.has(item.id))
              ? { ...item, read_at: readAt }
              : item,
          ),
        },
    );
    refreshNotifications();
  }, []);

  useEffect(() => {
    if (!items?.length || !listRef.current) return;
    const rows =
      listRef.current.querySelectorAll<HTMLElement>("[data-unread-id]");
    const pending = marking.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (document.hidden) return;
        const ids: number[] = [];
        for (const entry of entries) {
          if (entry.intersectionRatio === 0) continue;
          const id = Number((entry.target as HTMLElement).dataset.unreadId);
          if (pending.has(id)) continue;
          pending.add(id);
          ids.push(id);
        }
        for (let offset = 0; offset < ids.length; offset += 500) {
          const batch = ids.slice(offset, offset + 500);
          markVisibleNotificationsRead(batch)
            .then(() => applyRead(new Set(batch)))
            .catch(showMarkReadError)
            .finally(() => batch.forEach((id) => pending.delete(id)));
        }
      },
      { threshold: Number.EPSILON },
    );

    const observeVisibleTab = () => {
      observer.disconnect();
      if (!document.hidden) rows.forEach((row) => observer.observe(row));
    };
    observeVisibleTab();
    document.addEventListener("visibilitychange", observeVisibleTab);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", observeVisibleTab);
    };
  }, [applyRead, items]);

  async function markAllRead() {
    setMarkingAllRead(true);
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      applyRead();
    } catch {
      showMarkReadError();
    } finally {
      setMarkingAllRead(false);
    }
  }

  async function loadMore() {
    if (!page?.next || loadingMore) return;
    const current = page;
    setLoadingMore(true);
    try {
      const next = await listNotifications(current.next);
      setPage((previous) =>
        previous?.next === current.next
          ? { items: [...previous.items, ...next.items], next: next.next }
          : previous,
      );
      setError("");
    } catch {
      setError("Не удалось загрузить ещё уведомления");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        actions={
          <>
            {unreadCount > 0 ? (
              <Button
                isPending={markingAllRead}
                size="sm"
                variant="secondary"
                onPress={markAllRead}
              >
                <MdDoneAll aria-hidden="true" />
                Прочитать всё
              </Button>
            ) : null}
            <Modal>
              <Button
                isIconOnly
                aria-label="Настройки уведомлений"
                size="sm"
                variant="tertiary"
              >
                <MdSettings aria-hidden="true" />
              </Button>
              <Modal.Backdrop>
                <Modal.Container placement="center">
                  <Modal.Dialog className="md:max-w-4xl">
                    <Modal.CloseTrigger aria-label="Закрыть" />
                    <Modal.Header className="pr-8">
                      <Modal.Heading>Настройки уведомлений</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <SettingNotifications />
                    </Modal.Body>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </>
        }
        dividerClassName="mt-2"
        title="Уведомления"
      />
      {error ? <p role="alert">{error}</p> : null}
      {!page && !error ? <p role="status">Загрузка…</p> : null}
      {!error && page?.items.length === 0 ? (
        <EmptyState
          icon={<MdNotificationsNone />}
          title="Пока нет уведомлений"
        />
      ) : null}
      {page?.items.length ? (
        <ul ref={listRef} className="flex flex-col gap-2">
          {page.items.map((item) => (
            <li
              key={item.id}
              data-unread-id={item.read_at ? undefined : item.id}
            >
              <Link
                className="flex items-start gap-3 rounded-3xl bg-surface px-4 py-3 shadow-md transition-colors hover:bg-default"
                href={item.href}
              >
                {notificationIcons[item.kind] ? (
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-3xl leading-none shadow-sm dark:bg-sky-400/20"
                  >
                    {notificationIcons[item.kind]}
                  </span>
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col gap-1 self-center">
                  <div className="flex items-baseline gap-3">
                    <span
                      className={
                        item.read_at ? "text-sm" : "text-sm font-semibold"
                      }
                    >
                      {!item.read_at ? (
                        <span className="sr-only">Непрочитанное. </span>
                      ) : null}
                      {item.title}
                    </span>
                    <time
                      className="ml-auto shrink-0 text-xs text-muted"
                      dateTime={item.created_at}
                    >
                      {new Date(item.created_at).toLocaleString("ru-RU", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                  {item.entity_title || item.body ? (
                    <div>
                      {item.entity_title ? (
                        <p className="wrap-anywhere text-sm font-medium">
                          {item.entity_title}
                        </p>
                      ) : null}
                      {item.body ? (
                        <p className="wrap-anywhere leading-5 whitespace-pre-wrap text-muted">
                          {item.body}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {page?.next ? (
        <Button
          className="self-center"
          isPending={loadingMore}
          variant="secondary"
          onPress={loadMore}
        >
          Загрузить ещё
        </Button>
      ) : null}
    </div>
  );
}
