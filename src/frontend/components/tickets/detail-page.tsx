"use client";
import { Button, Chip, Surface } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import useWebSocket from "react-use-websocket";

import { CustomBreadcrumbs } from "../breadcrumbs";
import { MessageForm } from "../input-message";
import PageHeader from "../pageHeader";
import { PageSpinner } from "../pageSpinner";

import { TicketItem } from "./item";

import { IError } from "@/lib/models";
import { IResponse } from "@/lib/models/response";
import { IMessage, ITicket } from "@/lib/models/ticket";
import { getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";
import { closeTicket } from "@/lib/client-requests/ticket";

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
    (ticketId: number, content: string): Promise<IMessage>;
  };
  withAuthor?: boolean;
}) => {
  const [ticket, setTicket] = useState<ITicket>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { lastJsonMessage, sendJsonMessage } = useWebSocket(getWebsocketUrl, {
    share: true,
    filter: (message) => {
      return isEvent(message, WSEvent.Update, `ticket_${ticketId}`);
    },
  });

  useEffect(() => {
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
    sendJsonMessage({
      event: WSEvent.Subscribe,
      channel: `ticket_${ticketId}`,
    });
    fetchData();
  }, [lastJsonMessage]);

  async function createMessage(message: string) {
    const result = await addTicketMessageFunc(ticketId, message);
    setMessages([...messages, result]);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="px-4">
      <PageHeader>
        <CustomBreadcrumbs
          items={[
            {
              title: "Поддержка",
              href: "/tickets",
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
            <div className="overflow-y-auto flex flex-col gap-4">
              {messages.map((message) => {
                return (
                  <Surface
                    key={message.id}
                    className={twMerge(
                      "rounded-3xl px-4 py-2 max-w-1/2 min-w-40 h-auto mx-4 shadow-md",
                      ticket.author_id == message.sender_id
                        ? " ml-auto"
                        : "mr-auto",
                    )}
                    variant="secondary"
                  >
                    <div className="flex flex-col">
                      {" "}
                      {message.content}{" "}
                      <Chip
                        className="ml-auto"
                        color="default"
                        variant="primary"
                      >
                        {new Date(message.created_at).toLocaleString()}
                      </Chip>
                    </div>
                  </Surface>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="mt-auto">
              <div className="mt-4">
                <MessageForm maxLength={200} onSend={createMessage} />
              </div>
              {ticket.status != "closed" ? (
                <Button
                  fullWidth
                  className="mt-4"
                  onPress={() => closeTicket(ticketId)}
                >
                  Вопрос решен
                </Button>
              ) : null}
            </div>
          </Surface>
        </div>
      )}
    </div>
  );
};
