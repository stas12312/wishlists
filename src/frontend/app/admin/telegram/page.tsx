"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, Chip, Input, Spinner, Table } from "@heroui/react";
import { MdChevronRight, MdSearch, MdSend } from "react-icons/md";

import { EmptyState } from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import {
  getTelegramChats,
  getTelegramMessages,
  type TelegramChat,
  type TelegramPage,
} from "@/lib/client-requests/admin/telegram";

const formatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});
const kinds: Record<string, string> = {
  text: "Текст",
  service: "Служебное сообщение",
  animation: "Анимация",
  audio: "Аудио",
  document: "Документ",
  paid_media: "Платное медиа",
  photo: "Фото",
  sticker: "Стикер",
  video: "Видео",
  video_note: "Видеосообщение",
  voice: "Голосовое сообщение",
  contact: "Контакт",
  dice: "Кубик",
  game: "Игра",
  poll: "Опрос",
  venue: "Место",
  location: "Геопозиция",
  story: "История",
};

function useTelegramPage<T>(
  load: (
    before: string | undefined,
    signal: AbortSignal,
  ) => Promise<TelegramPage<T>>,
) {
  const [cursors, setCursors] = useState<string[]>([]);
  const [result, setResult] = useState<{
    cursors: string[];
    page?: TelegramPage<T>;
  }>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(cursors.at(-1), controller.signal).then(
      (page) => {
        if (!controller.signal.aborted) setResult({ cursors, page });
      },
      () => {
        if (!controller.signal.aborted) setResult({ cursors });
      },
    );
    return () => controller.abort();
  }, [load, cursors, attempt]);

  const current = result?.cursors === cursors ? result : undefined;
  return {
    page: current?.page,
    loading: !current,
    previous: cursors.length
      ? () => setCursors(cursors.slice(0, -1))
      : undefined,
    next: current?.page?.next
      ? () => setCursors([...cursors, current.page!.next!])
      : undefined,
    retry: () => {
      setResult(undefined);
      setAttempt((value) => value + 1);
    },
  };
}

function Pagination({
  previous,
  next,
}: {
  previous?: () => void;
  next?: () => void;
}) {
  if (!previous && !next) return null;
  return (
    <div className="flex justify-end gap-2">
      <Button
        isDisabled={!previous}
        size="sm"
        variant="secondary"
        onPress={previous}
      >
        Назад
      </Button>
      <Button isDisabled={!next} size="sm" variant="secondary" onPress={next}>
        Дальше
      </Button>
    </div>
  );
}

function LoadError({ retry }: { retry: () => void }) {
  return (
    <div role="alert">
      <EmptyState
        compact
        action={
          <Button size="sm" variant="secondary" onPress={retry}>
            Повторить
          </Button>
        }
        title="Не удалось загрузить журнал Telegram"
      />
    </div>
  );
}

function LinkedUser({ chat }: { chat: TelegramChat }) {
  return chat.user_id ? (
    <Link
      className="break-all text-accent hover:underline"
      href={`/admin/users/${chat.user_id}`}
    >
      {chat.username ? `@${chat.username}` : `Пользователь №${chat.user_id}`}
    </Link>
  ) : (
    <span className="text-muted">Нет привязки</span>
  );
}

function Conversation({ chat }: { chat: TelegramChat }) {
  const load = useCallback(
    (before: string | undefined, signal: AbortSignal) =>
      getTelegramMessages(chat.chat_id, before, signal),
    [chat.chat_id],
  );
  const { page, loading, previous, next, retry } = useTelegramPage(load);

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="break-all text-lg font-medium">Чат {chat.chat_id}</h2>
        <LinkedUser chat={chat} />
      </div>
      <div className="flex flex-col gap-3">
        {loading && (
          <Spinner aria-label="Загрузка сообщений" className="self-center" />
        )}
        {!loading && !page && <LoadError retry={retry} />}
        {page?.data.length === 0 && (
          <EmptyState compact title="В чате пока нет сообщений" />
        )}
        {page && page.data.length > 0 && (
          <ol className="divide-y divide-default overflow-hidden rounded-2xl bg-surface">
            {page?.data.map((message) => {
              const edited = message.kind.startsWith("edited_");
              const kind = message.kind.replace(/^edited_/, "");
              return (
                <li key={message.id} className="px-3 py-3 sm:px-4">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="flex flex-wrap items-center gap-2">
                      <Chip
                        color={
                          message.direction === "incoming"
                            ? "default"
                            : "accent"
                        }
                        size="sm"
                        variant="soft"
                      >
                        {message.direction === "incoming"
                          ? "Входящее"
                          : "Исходящее"}
                      </Chip>
                      <span>
                        {kinds[kind] ?? kind}
                        {edited && " · Изменено"}
                      </span>
                    </span>
                    <time dateTime={message.sent_at}>
                      {formatter.format(new Date(message.sent_at))}
                    </time>
                  </div>
                  {message.text && (
                    <p className="mt-2 text-sm whitespace-pre-wrap wrap-anywhere">
                      {message.text}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        <Pagination next={next} previous={previous} />
      </div>
    </section>
  );
}

function Journal({ filter }: { filter: string }) {
  const [selected, setSelected] = useState<TelegramChat>();
  const load = useCallback(
    (before: string | undefined, signal: AbortSignal) =>
      getTelegramChats(filter, before, signal),
    [filter],
  );
  const { page, loading, previous, next, retry } = useTelegramPage(load);
  const chat = selected ?? (filter ? page?.data[0] : undefined);

  return (
    <div
      className={
        chat
          ? "grid gap-4 lg:grid-cols-[minmax(17rem,24rem)_minmax(0,1fr)]"
          : undefined
      }
    >
      <section className="flex min-w-0 flex-col gap-3">
        {loading && (
          <Spinner aria-label="Загрузка чатов" className="self-center" />
        )}
        {!loading && !page && <LoadError retry={retry} />}
        {page?.data.length === 0 && (
          <EmptyState
            icon={<MdSend />}
            title={filter ? "Чат не найден" : "В журнале пока нет чатов"}
          />
        )}
        {page && page.data.length > 0 && (
          <Table>
            <Table.ScrollContainer>
              <Table.Content
                aria-label="Чаты Telegram"
                onRowAction={(key) =>
                  setSelected(page.data.find((item) => item.chat_id === key))
                }
              >
                <Table.Header>
                  <Table.Column isRowHeader>ID чата</Table.Column>
                  <Table.Column>Пользователь</Table.Column>
                  <Table.Column aria-label="Открыть чат" />
                </Table.Header>
                <Table.Body items={page.data}>
                  {(item) => (
                    <Table.Row
                      className={
                        chat?.chat_id === item.chat_id
                          ? "cursor-pointer bg-accent-soft"
                          : "cursor-pointer"
                      }
                      id={item.chat_id}
                    >
                      <Table.Cell className="font-medium tabular-nums">
                        {item.chat_id}
                      </Table.Cell>
                      <Table.Cell>
                        <LinkedUser chat={item} />
                      </Table.Cell>
                      <Table.Cell>
                        <MdChevronRight
                          aria-hidden="true"
                          className="text-lg text-muted"
                        />
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
        <Pagination next={next} previous={previous} />
      </section>
      {chat && <Conversation key={chat.chat_id} chat={chat} />}
    </div>
  );
}

export default function TelegramJournalPage() {
  const [filter, setFilter] = useState("");
  const [value, setValue] = useState("");

  return (
    <>
      <PageHeader title="Telegram" />
      <div className="flex flex-col gap-4">
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setFilter(value.trim());
          }}
        >
          <div className="relative w-full sm:max-w-[280px]">
            <MdSearch
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-xl text-muted"
            />
            <Input
              aria-label="ID чата"
              className="w-full pl-10"
              pattern="-?[0-9]{1,19}"
              placeholder="Поиск по ID чата"
              title="Введите числовой ID чата"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <Button type="submit">Найти</Button>
          {filter && (
            <Button
              variant="secondary"
              onPress={() => {
                setValue("");
                setFilter("");
              }}
            >
              Все чаты
            </Button>
          )}
        </form>
        <Journal key={filter} filter={filter} />
      </div>
    </>
  );
}
