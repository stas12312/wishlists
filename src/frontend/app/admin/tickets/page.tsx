"use client";
import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import { ITicket } from "@/lib/models/ticket";
import { TicketsList } from "@/components/ticket/TicketList";
import { InfinityLoader } from "@/components/InfinityLoader";
import { getTicketsForAdmin } from "@/lib/client-requests/admin/ticket";
import { INavigation } from "@/lib/models";

export default function Page() {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [navigation, setNavigation] = useState<INavigation>({
    count: 25,
    cursor: [""],
  });

  async function loadTickets() {
    if (!hasMore) {
      return;
    }
    const data = await getTicketsForAdmin(navigation);
    setTickets([...tickets, ...data.data]);
    setNavigation(data.navigation);
    setHasMore(data.data.length > 0);
  }

  useEffect(() => {
    loadTickets();
  }, []);
  return (
    <>
      <PageHeader title="Обращения" />
      <InfinityLoader onLoad={loadTickets}>
        <TicketsList withAuthor tickets={tickets} />
      </InfinityLoader>
    </>
  );
}
