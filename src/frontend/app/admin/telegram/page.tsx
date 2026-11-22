"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button, Input, Spinner } from "@heroui/react";
import {
  MdArrowBack,
  MdChatBubbleOutline,
  MdSearch,
  MdSend,
} from "react-icons/md";

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

function useTelegramHistory<T>(
  load: (
    before: string | undefined,
    signal: AbortSignal,
  ) => Promise<TelegramPage<T>>,
  scrollUp = false,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const boundary = useRef<HTMLElement | null>(null);
  const anchor = useRef<number | undefined>(undefined);
  const [request, setRequest] = useState<{ before?: string }>({});
  const [result, setResult] = useState<{
    request: typeof request;
    page?: TelegramPage<T>;
    error?: boolean;
  }>();
  const page = result?.page;
  const loading = result?.request !== request;

  useEffect(() => {
    const controller = new AbortController();
    load(request.before, controller.signal).then(
      (batch) => {
        if (controller.signal.aborted) return;
        if (scrollUp && viewport.current) {
          anchor.current = request.before
            ? viewport.current.scrollHeight
            : undefined;
        }
        setResult((current) => ({
          request,
          page: {
            data: request.before
              ? [...(current?.page?.data ?? []), ...batch.data]
              : batch.data,
            next: batch.next,
          },
        }));
      },
      () => {
        if (!controller.signal.aborted)
          setResult((current) => ({
            request,
            page: current?.page,
            error: true,
          }));
      },
    );
    return () => controller.abort();
  }, [load, request, scrollUp]);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!scrollUp || !element || !page) return;
    element.scrollTop =
      anchor.current === undefined
        ? element.scrollHeight
        : element.scrollTop + element.scrollHeight - anchor.current;
  }, [page, scrollUp]);

  const next = page?.next;
  const failed = !loading && result?.error === true;
  useEffect(() => {
    const root = viewport.current;
    const target = boundary.current;
    if (!root || !target || loading || failed || !next) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setRequest({ before: next });
        }
      },
      { root },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [failed, loading, next]);

  return {
    page,
    loading,
    failed,
    viewport,
    boundary,
    retry: () => setRequest({ ...request }),
  };
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

function ChatAvatar({ chat }: { chat: TelegramChat }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft font-medium text-accent-soft-foreground"
    >
      {chat.username ? chat.username[0].toUpperCase() : <MdChatBubbleOutline />}
    </span>
  );
}

function Conversation({
  chat,
  onBack,
}: {
  chat: TelegramChat;
  onBack: () => void;
}) {
  const load = useCallback(
    (before: string | undefined, signal: AbortSignal) =>
      getTelegramMessages(chat.chat_id, before, signal),
    [chat.chat_id],
  );
  const { page, loading, failed, viewport, boundary, retry } =
    useTelegramHistory(load, true);

  return (
    <section
      aria-label="Переписка"
      className="flex min-h-0 min-w-0 flex-col bg-background"
    >
      <header className="flex min-h-16 shrink-0 items-center gap-3 border-b border-default bg-surface p-3 lg:py-2">
        <button
          aria-label="К списку чатов"
          className="grid size-10 shrink-0 place-items-center rounded-full text-xl hover:bg-accent-soft lg:hidden"
          type="button"
          onClick={onBack}
        >
          <MdArrowBack aria-hidden="true" />
        </button>
        <ChatAvatar chat={chat} />
        <div className="min-w-0 text-sm">
          <h2 className="break-all font-medium">Чат {chat.chat_id}</h2>
          <LinkedUser chat={chat} />
        </div>
      </header>
      <div
        ref={viewport}
        className="min-h-0 flex-1 overflow-y-auto [overflow-anchor:none] p-3 sm:p-4"
      >
        {loading && !page && (
          <div className="flex justify-center">
            <Spinner aria-label="Загрузка сообщений" />
          </div>
        )}
        {failed && <LoadError retry={retry} />}
        {page?.data.length === 0 && (
          <EmptyState compact title="В чате пока нет сообщений" />
        )}
        {page && page.data.length > 0 && (
          <ol className="mx-auto flex min-h-full max-w-4xl flex-col justify-end gap-2">
            {page.next && (
              <li
                ref={(element) => {
                  boundary.current = element;
                }}
                aria-hidden="true"
                className="h-px"
              />
            )}
            {page.data
              .slice()
              .reverse()
              .map((message) => {
                const outgoing = message.direction === "outgoing";
                const edited = message.kind.startsWith("edited_");
                const kind = message.kind.replace(/^edited_/, "");
                return (
                  <li
                    key={message.id}
                    className={
                      outgoing
                        ? "max-w-[88%] self-end rounded-2xl rounded-br-sm bg-accent-soft px-3 py-2 text-sm sm:max-w-[75%]"
                        : "max-w-[88%] self-start rounded-2xl rounded-bl-sm bg-surface px-3 py-2 text-sm sm:max-w-[75%]"
                    }
                  >
                    <span className="sr-only">
                      {outgoing ? "Исходящее" : "Входящее"}
                    </span>
                    {message.text && (
                      <p className="whitespace-pre-wrap wrap-anywhere">
                        {message.text}
                      </p>
                    )}
                    <div className="flex flex-wrap justify-end gap-x-2 text-xs text-muted">
                      {(kind !== "text" || !message.text) && (
                        <span>{kinds[kind] ?? kind}</span>
                      )}
                      {edited && <span>Изменено</span>}
                      <time dateTime={message.sent_at}>
                        {formatter.format(new Date(message.sent_at))}
                      </time>
                    </div>
                  </li>
                );
              })}
          </ol>
        )}
      </div>
    </section>
  );
}

function Journal({
  filter,
  search,
}: {
  filter: string;
  search: React.ReactNode;
}) {
  const [selected, setSelected] = useState<TelegramChat | null>();
  const load = useCallback(
    (before: string | undefined, signal: AbortSignal) =>
      getTelegramChats(filter, before, signal),
    [filter],
  );
  const { page, loading, failed, viewport, boundary, retry } =
    useTelegramHistory(load);
  const chat = selected === undefined && filter ? page?.data[0] : selected;

  return (
    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-2xl border border-default bg-surface lg:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)]">
      <section
        aria-label="Чаты Telegram"
        className={
          chat
            ? "hidden min-h-0 min-w-0 flex-col lg:flex lg:border-r lg:border-default"
            : "flex min-h-0 min-w-0 flex-col lg:border-r lg:border-default"
        }
      >
        {search}
        <div ref={viewport} className="min-h-0 flex-1 overflow-y-auto">
          {loading && !page && (
            <div className="flex justify-center p-4">
              <Spinner aria-label="Загрузка чатов" />
            </div>
          )}
          {failed && <LoadError retry={retry} />}
          {page?.data.length === 0 && (
            <EmptyState
              compact
              icon={<MdSend />}
              title={filter ? "Чат не найден" : "В журнале пока нет чатов"}
            />
          )}
          {page && page.data.length > 0 && (
            <ul className="space-y-1 p-2">
              {page.data.map((item) => (
                <li key={item.chat_id}>
                  <button
                    aria-current={
                      chat?.chat_id === item.chat_id ? "true" : undefined
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-accent-soft aria-[current=true]:bg-accent-soft"
                    type="button"
                    onClick={() => setSelected(item)}
                  >
                    <ChatAvatar chat={item} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {item.username
                          ? "@" + item.username
                          : item.user_id
                            ? "Пользователь №" + item.user_id
                            : "Чат " + item.chat_id}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {item.user_id ? "Чат " + item.chat_id : "Нет привязки"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {page?.next && (
            <div
              ref={(element) => {
                boundary.current = element;
              }}
              aria-hidden="true"
              className="h-px"
            />
          )}
        </div>
      </section>
      {chat ? (
        <Conversation
          key={chat.chat_id}
          chat={chat}
          onBack={() => setSelected(null)}
        />
      ) : (
        <div className="hidden place-items-center bg-background lg:grid">
          <EmptyState
            compact
            icon={<MdChatBubbleOutline />}
            title="Выберите чат"
          />
        </div>
      )}
    </div>
  );
}

export default function TelegramJournalPage() {
  const [filter, setFilter] = useState("");
  const [value, setValue] = useState("");

  return (
    <div data-admin-telegram className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Telegram" />
      <Journal
        key={filter}
        filter={filter}
        search={
          <form
            className="flex min-h-16 shrink-0 flex-wrap items-center gap-2 border-b border-default p-3"
            onSubmit={(event) => {
              event.preventDefault();
              setFilter(value.trim());
            }}
          >
            <div className="relative min-w-0 flex-1 basis-36">
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
        }
      />
    </div>
  );
}
