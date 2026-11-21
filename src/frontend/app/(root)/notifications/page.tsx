import { Metadata } from "next";

import { NotificationInbox } from "@/components/notifications/NotificationInbox";

export const metadata: Metadata = { title: "Уведомления" };

export default function NotificationsPage() {
  return <NotificationInbox />;
}
