"use client";
import { TicketDetailPage } from "../ticket/TicketDetailPage";

import {
  addTicketMessageForAdmin,
  getTicketForAdmin,
  getTicketMessagesForAdmin,
} from "@/lib/client-requests/admin/ticket";

export const AdminTicketDetailPage = ({ ticketId }: { ticketId: number }) => {
  return (
    <TicketDetailPage
      withAuthor
      withStatusCommands
      addTicketMessageFunc={addTicketMessageForAdmin}
      getTicketFunc={getTicketForAdmin}
      getTicketMessageFunc={getTicketMessagesForAdmin}
      ticketId={ticketId}
    />
  );
};
