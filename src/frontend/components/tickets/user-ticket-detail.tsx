"use client";
import { TicketDetailPage } from "./detail-page";

import {
  addTicketMessage,
  getTicket,
  getTicketMessages,
} from "@/lib/client-requests/ticket";

export const UserTicketDetailPage = ({ ticketId }: { ticketId: number }) => {
  return (
    <TicketDetailPage
      addTicketMessageFunc={addTicketMessage}
      getTicketFunc={getTicket}
      getTicketMessageFunc={getTicketMessages}
      ticketId={ticketId}
    />
  );
};
