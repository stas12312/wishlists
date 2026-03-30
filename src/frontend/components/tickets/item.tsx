"use client";
import { Chip, Link, Surface } from "@heroui/react";

import { UserChip } from "../user";

import { ITicket } from "@/lib/models/ticket";

export const TicketItem = ({
  ticket,
  withOpenLink = false,
  withAuthor = false,
}: {
  ticket: ITicket;
  withOpenLink?: boolean;
  withAuthor?: boolean;
}) => {
  return (
    <Surface className="rounded-3xl px-4 py-2 shadow-md">
      <div className="flex justify-between">
        <div className="flex gap-4">
          {withAuthor ? (
            <UserChip className="h-10" user={ticket.author} />
          ) : null}
          <div className="my-auto">{ticket.subject}</div>
        </div>

        <div className="flex gap-1">
          <Chip style={{ background: ticket.category.color }}>
            {ticket.category.title}
          </Chip>
          <Chip>#{ticket.id}</Chip>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Chip color={getStatus(ticket.status)[1]} variant="primary">
          {getStatus(ticket.status)[0]}
        </Chip>
        {withOpenLink ? (
          <Link
            className="no-underline text-accent hover:text-accent/80 transition"
            href={`tickets/${ticket.id}`}
          >
            Открыть
          </Link>
        ) : null}
      </div>
    </Surface>
  );
};

function getStatus(
  status: string,
): [
  string,
  "accent" | "success" | "warning" | "danger" | "default" | undefined,
] {
  switch (status) {
    case "open":
      return ["На рассмотрении", "accent"];
    case "resolved":
      return ["Решено", "success"];
    case "closed":
      return ["Закрыто", "success"];
    case "waiting_info":
      return ["На уточнении", "warning"];
    case "waiting_fix":
      return ["Ожидает исправление", "warning"];
  }
  return ["", "default"];
}
