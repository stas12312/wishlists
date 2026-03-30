"use client";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import { useRouter } from "next/navigation";

import PageHeader from "../pageHeader";

import { TicketsList } from "./list";

import { getTickests as getTickets } from "@/lib/client-requests/ticket";
import { ITicket } from "@/lib/models/ticket";

export const TicketsPage = () => {
  const [tickets, setTickets] = useState<ITicket[]>([]);

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const data = await getTickets();
      setTickets(data.data);
    }
    fetchData();
  }, []);

  return (
    <>
      <PageHeader title="Поддержка" />
      <Button
        fullWidth
        onPress={() => {
          router.push("/tickets/new");
        }}
      >
        Новое обращение
        <MdAdd />
      </Button>
      <div className="my-2" />
      <TicketsList tickets={tickets} />
    </>
  );
};
