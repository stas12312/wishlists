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

import { TicketItem } from "./TicketCard";

import { closeTicket } from "@/lib/client-requests/ticket";
import { IError } from "@/lib/models";
import { IResponse } from "@/lib/models/response";
import { IMessage, ITicket } from "@/lib/models/ticket";
import { getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";
import { prepareDateString } from "@/lib/date";

export const TicketDetailPage = ({
  ticketId,
  getTicketFunc,
  getTicketMessageFunc,
  addTicketMessageFunc,
  withAuthor = false,
}: {
  ticketId: number;
  getTicketFunc: { (ticketId: number): Promise<IResponse<ITicket> | IError> };
  getTicketMessageFunc: { (ticketId: number): Promise<IMessage[]> };
  addTicketMessageFunc: {
    (ticketId: number, content: string): Promise<IResponse<IMessage> | IError>;
  };
  withAuthor?: boolean;
}) => {
  const [ticket, setTicket] = useState<ITicket>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFirstScroll, setIsFirstScroll] = useState(true);

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
    sendJsonMessage({
      event: WSEvent.Subscribe,
      channel: `ticket_${ticketId}`,
    });
    fetchData();
  }, [lastJsonMessage]);

  async function createMessage(message: string) {
    const result = await addTicketMessageFunc(ticketId, message);
    if ("message" in result) {
      toast.danger(`Произошла ошибка при отправке сообщения`, {
        description: result.message,
      });
    } else {
      setMessages([...messages, result.data]);
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
                      <span className="px-4 pt-2">{message.content}</span>

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
              <div className="mt-4">
                <MessageForm maxLength={200} onSend={createMessage} />
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
