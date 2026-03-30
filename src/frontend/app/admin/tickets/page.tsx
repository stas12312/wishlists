"use client";
import { useEffect, useState } from "react";

import PageHeader from "@/components/pageHeader";
import { ITicket } from "@/lib/models/ticket";
import { TicketsList } from "@/components/tickets/list";
import { getTicketsForAdmin } from "@/lib/client-requests/admin/ticket";

export default function Page() {
  const [tickets, setTickets] = useState<ITicket[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getTicketsForAdmin();
      setTickets(data.data);
    }
    fetchData();
  }, []);

  return (
    <>
      <PageHeader title="Обращения" />
      <TicketsList withAuthor tickets={tickets} />
    </>
  );
}
