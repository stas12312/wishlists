"use client";
import { Chip, Link, Surface } from "@heroui/react";
import { usePress } from "react-aria";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

import { UserChip } from "../user";

import { hexToRgba } from "@/lib/color";
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
  const router = useRouter();
  let { pressProps, isPressed } = usePress({
    onPress: () => (withOpenLink ? router.push(`tickets/${ticket.id}`) : null),
  });

  return (
    <div
      className={twMerge(
        "transition",
        withOpenLink ? " md:hover:scale-[1.01]" : null,
      )}
    >
      <Surface
        className={twMerge(
          "rounded-3xl px-4 py-2 shadow-md transition",
          withOpenLink
            ? "data-[pressed=true]:scale-[0.98] cursor-pointer"
            : "null",
        )}
        {...pressProps}
        data-pressed={isPressed ? "true" : undefined}
      >
        <div className="flex justify-between ">
          <div className="flex gap-4">
            {withAuthor ? <UserChip user={ticket.author} /> : null}
            <div className="my-auto font-bold text-lg">{ticket.subject}</div>
          </div>

          <div className="flex gap-1 flex-none w-auto h-8">
            <Chip
              size="lg"
              style={{ background: hexToRgba(ticket.category.color, 0.7) }}
            >
              {ticket.category.title}
            </Chip>
            <Chip size="lg">#{ticket.id}</Chip>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Chip color={getStatus(ticket.status)[1]} size="lg" variant="primary">
            {getStatus(ticket.status)[0]}
          </Chip>
          {withOpenLink ? (
            <Link
              className="no-underline text-accent hover:text-accent/80 transition my-auto"
              href={`tickets/${ticket.id}`}
            >
              Открыть
            </Link>
          ) : null}
        </div>
      </Surface>
    </div>
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
      return ["Закрыто", "default"];
    case "waiting_info":
      return ["Ожидает вашего ответа", "warning"];
    case "waiting_fix":
      return ["Ожидает исправление", "warning"];
  }
  return ["", "default"];
}
