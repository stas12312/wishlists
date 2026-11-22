import { clientAxios } from "../base";

export interface TelegramChat {
  chat_id: string;
  user_id: string | null;
  username: string | null;
}

export interface TelegramMessage {
  id: string;
  message_id: string;
  direction: "incoming" | "outgoing";
  kind: string;
  text: string;
  sent_at: string;
}

export interface TelegramPage<T> {
  data: T[];
  next?: string;
}

async function getPage<T>(
  path: string,
  params: Record<string, string | undefined>,
  signal: AbortSignal,
): Promise<TelegramPage<T>> {
  const response = await clientAxios.get<TelegramPage<T>>(path, {
    params,
    signal,
  });
  if (response.status !== 200) {
    throw new Error("Не удалось загрузить журнал Telegram");
  }
  return response.data;
}

export function getTelegramChats(
  chatId: string,
  before: string | undefined,
  signal: AbortSignal,
) {
  return getPage<TelegramChat>(
    "/admin/telegram/chats",
    { chat_id: chatId || undefined, before },
    signal,
  );
}

export function getTelegramMessages(
  chatId: string,
  before: string | undefined,
  signal: AbortSignal,
) {
  return getPage<TelegramMessage>(
    `/admin/telegram/chats/${encodeURIComponent(chatId)}/messages`,
    { before },
    signal,
  );
}
