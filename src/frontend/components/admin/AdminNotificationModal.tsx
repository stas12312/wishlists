"use client";

import { Button, Modal, Spinner } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { notificationDateTime, NotificationStatus } from "./notificationCommon";

import {
  getAdminNotification,
  getAdminNotificationQuestion,
} from "@/lib/client-requests/admin/notification";
import {
  AdminNotificationDetail,
  AdminNotificationQuestion,
} from "@/lib/models/admin-notification";

export function AdminNotificationModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const [item, setItem] = useState<
    AdminNotificationDetail | null | undefined
  >();
  useEffect(() => {
    const controller = new AbortController();
    getAdminNotification(id, controller.signal)
      .then(setItem)
      .catch(() => {
        if (!controller.signal.aborted) setItem(null);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Container placement="center" size="cover">
        <Modal.Dialog className="w-full max-w-200 px-3 md:px-5">
          <Modal.CloseTrigger />
          <Modal.Header className="border-b border-border/60 pb-3">
            <span className="text-sm text-muted">Уведомление #{id}</span>
            <Modal.Heading className="pr-8 text-xl wrap-anywhere md:text-2xl">
              {item?.title || item?.kind || "Уведомление"}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4 px-0 py-4">
            {item === undefined && (
              <Spinner
                aria-label="Загрузка уведомления"
                className="mx-auto my-8"
              />
            )}
            {item === null && (
              <p className="my-8 text-center text-muted" role="alert">
                Не удалось загрузить уведомление
              </p>
            )}
            {item && <NotificationDetail item={item} />}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function NotificationDetail({ item }: { item: AdminNotificationDetail }) {
  const [showQuestion, setShowQuestion] = useState(false);
  const isSupport = item.kind === "support.reply";
  const isQuestion =
    item.kind === "question.created" || item.kind === "question.answered";
  const hasResource = /^[1-9]\d*$/.test(item.resource_key);
  const sourceName = item.entity_title || `#${item.resource_key}`;

  return (
    <>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted">Получатель</dt>
        <dd className="wrap-anywhere">
          <Link
            className="text-accent hover:underline"
            href={`/admin/users/${item.recipient_id}`}
          >
            {item.recipient_name
              ? `${item.recipient_name} (@${item.username})`
              : `@${item.username}`}
          </Link>
        </dd>
        <dt className="text-muted">Создано</dt>
        <dd>{notificationDateTime(item.created_at)}</dd>
        {hasResource && (isSupport || isQuestion) && (
          <>
            <dt className="text-muted">{isSupport ? "Обращение" : "Вопрос"}</dt>
            <dd className="wrap-anywhere">
              {isSupport ? (
                <Link
                  className="text-accent hover:underline"
                  href={`/admin/tickets/${item.resource_key}`}
                >
                  {sourceName}
                </Link>
              ) : (
                <button
                  aria-expanded={showQuestion}
                  className="cursor-pointer text-left text-accent hover:underline"
                  type="button"
                  onClick={() => setShowQuestion((shown) => !shown)}
                >
                  {sourceName}
                </button>
              )}
            </dd>
          </>
        )}
      </dl>
      {showQuestion && <NotificationQuestion id={item.id} />}
      <section className="rounded-xl bg-default/50 p-3">
        <h3 className="text-sm font-medium text-muted">Текст уведомления</h3>
        <p className="mt-2 wrap-anywhere whitespace-pre-wrap">
          {item.body || "Текст отсутствует"}
        </p>
      </section>
      <section>
        <h3 className="mb-2 font-semibold">Каналы</h3>
        <dl className="divide-y divide-border/60 border-t border-border/60 text-sm">
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-x-2 py-2 md:grid-cols-[8rem_7rem_minmax(0,1fr)]">
            <dt>На сайте</dt>
            <dd>
              <NotificationStatus
                site
                status={item.read_at ? "read" : "unread"}
              />
            </dd>
            {item.read_at && (
              <dd className="col-start-2 mt-1 text-muted md:col-start-3 md:mt-0">
                {notificationDateTime(item.read_at)}
              </dd>
            )}
          </div>
          <DeliveryDetails
            attempts={item.email_attempts}
            channel="Email"
            error={item.email_error}
            status={item.email_status}
          />
          <DeliveryDetails
            attempts={item.telegram_attempts}
            channel="Telegram"
            error={item.telegram_error}
            status={item.telegram_status}
          />
        </dl>
      </section>
    </>
  );
}

const attemptPlural = new Intl.PluralRules("ru-RU");
const attemptWord = {
  one: "попытка",
  few: "попытки",
  many: "попыток",
  other: "попытки",
  zero: "попыток",
  two: "попытки",
};

function DeliveryDetails({
  channel,
  status,
  attempts,
  error,
}: {
  channel: string;
  status: string | null;
  attempts: number | null;
  error: string | null;
}) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-x-2 py-2 md:grid-cols-[8rem_7rem_minmax(0,1fr)]">
      <dt>{channel}</dt>
      <dd>
        <NotificationStatus status={status} />
      </dd>
      <dd className="col-start-2 mt-1 wrap-anywhere text-muted md:col-start-3 md:mt-0">
        {attempts === null
          ? "Отправка не планировалась"
          : `${attempts} ${attemptWord[attemptPlural.select(attempts)]}`}
        {error && <span className="block text-danger">{error}</span>}
      </dd>
    </div>
  );
}

function NotificationQuestion({ id }: { id: number }) {
  const [question, setQuestion] = useState<AdminNotificationQuestion | null>();
  const [hasError, setHasError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getAdminNotificationQuestion(id, controller.signal)
      .then(setQuestion)
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      });
    return () => controller.abort();
  }, [id, retry]);

  return (
    <section
      aria-label="Связанный вопрос"
      className="space-y-2 rounded-xl border border-border p-3"
    >
      {hasError ? (
        <div className="flex flex-wrap items-center gap-2" role="alert">
          <span>Не удалось загрузить вопрос</span>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              setHasError(false);
              setRetry((value) => value + 1);
            }}
          >
            Повторить
          </Button>
        </div>
      ) : question === undefined ? (
        <Spinner aria-label="Загрузка вопроса" size="sm" />
      ) : question === null ? (
        <p className="text-muted">Вопрос недоступен или был удалён</p>
      ) : (
        <>
          <h3 className="text-sm font-medium text-muted">Вопрос</h3>
          <p className="wrap-anywhere whitespace-pre-wrap">
            {question.content}
          </p>
          {question.answer && (
            <>
              <h3 className="text-sm font-medium text-muted">Ответ</h3>
              <p className="wrap-anywhere whitespace-pre-wrap">
                {question.answer}
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}
