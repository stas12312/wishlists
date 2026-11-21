"use client";
import { refreshNotifications } from "../notifications/useNotificationRefresh";

import { TicketDetailPage } from "./TicketDetailPage";

import { markNotificationEventsRead } from "@/lib/client-requests/notification";
import {
  addTicketMessage,
  getTicket,
  getTicketMessages,
} from "@/lib/client-requests/ticket";

async function markMessagesRead(ticketId: number) {
  try {
    await markNotificationEventsRead("support.reply", String(ticketId));
    refreshNotifications();
  } catch {
    // При повторном открытии обращения приложение снова отметит ответы прочитанными.
  }
}

export const UserTicketDetailPage = ({ ticketId }: { ticketId: number }) => {
  return (
    <TicketDetailPage
      addTicketMessageFunc={addTicketMessage}
      getTicketFunc={getTicket}
      getTicketMessageFunc={getTicketMessages}
      ticketId={ticketId}
      onMessagesViewed={markMessagesRead}
    />
  );
};
