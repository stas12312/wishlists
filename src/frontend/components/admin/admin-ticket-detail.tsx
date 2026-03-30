"use client";
import { TicketDetailPage } from "../tickets/detail-page";

import {
  addTicketMessageForAdmin,
  getTicketForAdmin,
  getTicketMessagesForAdmin,
} from "@/lib/client-requests/admin/ticket";

export const AdminTicketDetailPage = ({ ticketId }: { ticketId: number }) => {
  return (
    <TicketDetailPage
      withAuthor
      addTicketMessageFunc={addTicketMessageForAdmin}
      getTicketFunc={getTicketForAdmin}
      getTicketMessageFunc={getTicketMessagesForAdmin}
      ticketId={ticketId}
    />
  );
};
