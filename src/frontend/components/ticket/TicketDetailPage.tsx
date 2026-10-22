"use client";
import { Button, Chip, Separator, Surface, toast } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { MdDone } from "react-icons/md";
import useWebSocket from "react-use-websocket";
import { twMerge } from "tailwind-merge";

import { CustomBreadcrumbs } from "../Breadcrumbs";
import { MessageForm } from "../MessageForm";
import PageHeader from "../PageHeader";
import { PageSpinner } from "../PageSpinner";

import {
  AttachButton,
  MAX_ATTACHMENTS_COUNT,
  MessageAttachments,
  PendingAttachments,
  useTicketAttachments,
} from "./TicketAttachments";
import { getStatus, TicketItem } from "./TicketCard";

import { closeTicket } from "@/lib/client-requests/ticket";
import { IError } from "@/lib/models";
import { IResponse } from "@/lib/models/response";
import {
  IAttachment,
  IMessage,
  ITicket,
  TicketStatus,
} from "@/lib/models/ticket";
import { getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";
import { prepareDateString } from "@/lib/date";

const MESSAGE_MAX_LENGTH = 2000;

const STATUS_COMMANDS: { status: TicketStatus; title: string }[] = [
  { status: "waiting_info", title: "Запросить информацию" },
  { status: "waiting_fix", title: "Ожидает исправления" },
  { status: "resolved", title: "Решено" },
  { status: "closed", title: "Закрыть" },
  { status: "open", title: "Открыть" },
];

const STATUS_COMMAND_RE = /^[ \t]*\/status[ \t]+\w+[ \t]*$/gm;

const STATUS_BUTTON_CLASSES: Record<
  ReturnType<typeof getStatus>[1] & string,
  { idle: string; active: string }
> = {
  accent: {
    idle: "bg-accent/15 text-accent hover:bg-accent/25",
    active: "bg-accent text-accent-foreground",
  },
  success: {
    idle: "bg-success/15 text-success hover:bg-success/25",
    active: "bg-success text-success-foreground",
  },
  warning: {
    idle: "bg-warning/15 text-warning hover:bg-warning/25",
    active: "bg-warning text-warning-foreground",
  },
  danger: {
    idle: "bg-danger/15 text-danger hover:bg-danger/25",
    active: "bg-danger text-danger-foreground",
  },
  default: {
    idle: "bg-default text-foreground hover:bg-default-hover",
    active: "bg-foreground text-background",
  },
};

const URL_RE = /(https?:\/\/[^\s<>"']+)/g;
const URL_TRAILING_PUNCTUATION_RE = /[.,;:!?)\]}»]+$/;

function linkify(text: string) {
  return text.split(URL_RE).map((part, index) => {
    if (index % 2 === 0) return part;

    const trailing = part.match(URL_TRAILING_PUNCTUATION_RE)?.[0] ?? "";
    const url = part.slice(0, part.length - trailing.length);

    return (
      <span key={index}>
        <a
          className="text-accent underline break-all"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {url}
        </a>
        {trailing}
      </span>
    );
  });
}

function setStatusCommand(message: string, status: TicketStatus): string {
  const text = message.replace(STATUS_COMMAND_RE, "").trimEnd();

  return text ? `${text}\n/status ${status}` : `/status ${status}`;
}

export const TicketDetailPage = ({
  ticketId,
  getTicketFunc,
  getTicketMessageFunc,
  addTicketMessageFunc,
  withAuthor = false,
  withStatusCommands = false,
}: {
  ticketId: number;
  getTicketFunc: { (ticketId: number): Promise<IResponse<ITicket> | IError> };
  getTicketMessageFunc: { (ticketId: number): Promise<IMessage[]> };
  addTicketMessageFunc: {
    (
      ticketId: number,
      content: string,
      attachments: IAttachment[],
    ): Promise<IResponse<IMessage> | IError>;
  };
  withAuthor?: boolean;
  withStatusCommands?: boolean;
}) => {
  const [ticket, setTicket] = useState<ITicket>();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFirstScroll, setIsFirstScroll] = useState(true);
  const attachments = useTicketAttachments();

  const { lastJsonMessage, sendJsonMessage } = useWebSocket(getWebsocketUrl, {
    share: true,
    filter: (message) => {
      return isEvent(message, WSEvent.Update, `ticket_${ticketId}`);
    },
  });

  async function fetchData() {
    const data = await getTicketFunc(ticketId);
    const messages = await getTicketMessageFunc(ticketId);
    if ("message" in data) {
      setError(data.message);
    } else {
      setTicket(data.data);
      setMessages(messages);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [lastJsonMessage]);

  useEffect(() => {
    sendJsonMessage({
      event: WSEvent.Subscribe,
      channel: `ticket_${ticketId}`,
    });
    return () => {
      sendJsonMessage({
        event: WSEvent.Unsubscribe,
        channel: `ticket_${ticketId}`,
      });
    };
  }, []);

  async function createMessage(message: string) {
    const sentAttachments = attachments.attachments;
    const result = await addTicketMessageFunc(
      ticketId,
      message,
      sentAttachments,
    );
    if ("message" in result) {
      toast.danger(`Произошла ошибка при отправке сообщения`, {
        description: result.message,
      });
    } else {
      setMessages([...messages, result.data]);
      attachments.clearSent(sentAttachments);
    }
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isFirstScroll) {
      el.scrollTop = el.scrollHeight;
    } else {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }

    setIsFirstScroll(false);
  }, [messages]);

  return (
    <div>
      <PageHeader>
        <CustomBreadcrumbs
          items={[
            {
              title: "Поддержка",
              href: "../tickets",
            },
            {
              title: `Обращение #${ticketId}`,
              href: `/tickets/${ticketId}`,
            },
          ]}
        />
      </PageHeader>
      {isLoading ? (
        <PageSpinner />
      ) : error || !ticket ? (
        <div>Обращение не найдено</div>
      ) : (
        <div className="flex flex-col max-w-400 mx-auto ">
          <TicketItem ticket={ticket} withAuthor={withAuthor} />

          <Surface className="mt-4 rounded-3xl px-4 py-2 flex flex-col  h-[calc(100vh-300px)] shadow-md">
            <div
              ref={containerRef}
              className="overflow-y-auto flex flex-col gap-4"
            >
              {messages.map((message) => {
                return (
                  <Surface
                    key={message.id}
                    className={twMerge(
                      "rounded-3xl max-w-1/2 min-w-60 h-auto mx-4 shadow-md",
                      ticket.author_id == message.sender_id
                        ? " ml-auto"
                        : "mr-auto",
                    )}
                    variant="secondary"
                  >
                    <div className="flex flex-col">
                      {message.content ? (
                        <span className="px-4 pt-2 whitespace-pre-wrap wrap-break-word">
                          {linkify(message.content)}
                        </span>
                      ) : null}
                      <MessageAttachments
                        attachments={message.attachments}
                        className="px-4 pt-2"
                      />

                      <Chip className="ml-auto mr-2" variant="tertiary">
                        {prepareDateString(message.created_at)}
                      </Chip>
                    </div>
                  </Surface>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="mt-auto">
              <Separator />
              {withStatusCommands ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUS_COMMANDS.map(({ status, title }) => (
                    <Button
                      key={status}
                      className={
                        STATUS_BUTTON_CLASSES[
                          getStatus(status)[1] ?? "default"
                        ][ticket.status == status ? "active" : "idle"]
                      }
                      size="sm"
                      onPress={() =>
                        setDraft((value) => setStatusCommand(value, status))
                      }
                    >
                      {title}
                    </Button>
                  ))}
                </div>
              ) : null}
              <div className="mt-4">
                <MessageForm
                  isCompact
                  allowEmpty={attachments.attachments.length > 0}
                  footer={
                    <AttachButton
                      isDisabled={
                        attachments.items.length >= MAX_ATTACHMENTS_COUNT
                      }
                      onSelect={attachments.add}
                    />
                  }
                  isSendDisabled={attachments.isUploading}
                  maxLength={MESSAGE_MAX_LENGTH}
                  rows={1}
                  value={draft}
                  onSend={createMessage}
                  onValueChange={setDraft}
                />
                {attachments.items.length ? (
                  <div className="mt-2">
                    <PendingAttachments
                      items={attachments.items}
                      onRemove={attachments.remove}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="w-full flex justify-end">
              {ticket.status != "closed" ? (
                <Button
                  className="bg-success mt-2"
                  onPress={async () => {
                    closeTicket(ticketId);
                    await fetchData();
                  }}
                >
                  Закрыть обращение
                  <MdDone />
                </Button>
              ) : null}
            </div>
          </Surface>
        </div>
      )}
    </div>
  );
};
