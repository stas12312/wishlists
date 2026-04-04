"use client";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import { useRouter } from "next/navigation";

import PageHeader from "../PageHeader";
import { InfinityLoader } from "../InfinityLoader";
import { AnimatedList } from "../animated-list/AnimatedList";
import { PageSpinner } from "../PageSpinner";

import { TicketItem } from "./TicketCard";

import { getTickests as getTickets } from "@/lib/client-requests/ticket";
import { ITicket } from "@/lib/models/ticket";
import { INavigation } from "@/lib/models";

export const TicketsPage = () => {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [navigation, setNavigation] = useState<INavigation>({
    count: 25,
    cursor: [""],
  });
  const router = useRouter();

  async function loadTickets() {
    if (!hasMore) {
      return;
    }
    const data = await getTickets(navigation);
    setTickets([...tickets, ...data.data]);
    setNavigation(data.navigation);
    setHasMore(data.data.length > 0);
    setIsLoading(false);
  }

  useEffect(() => {
    loadTickets();
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
      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <div className="my-2" />
          <InfinityLoader onLoad={loadTickets}>
            <AnimatedList
              gridConfig="cols-1"
              items={tickets.map((ticket) => {
                return (
                  <TicketItem key={ticket.id} withOpenLink ticket={ticket} />
                );
              })}
            />
          </InfinityLoader>
        </>
      )}
    </>
  );
};
