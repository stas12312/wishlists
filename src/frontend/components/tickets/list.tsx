import { TicketItem } from "./item";

import { ITicket } from "@/lib/models/ticket";

export const TicketsList = ({
  tickets,
  withAuthor = false,
}: {
  tickets: ITicket[];
  withAuthor?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4">
      {tickets.map((item) => (
        <TicketItem
          key={item.id}
          withOpenLink
          ticket={item}
          withAuthor={withAuthor}
        />
      ))}
    </div>
  );
};
