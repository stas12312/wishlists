"use client";
import { buttonVariants } from "@heroui/react";
import { observer } from "mobx-react-lite";
import NextLink from "next/link";
import { MdSupportAgent } from "react-icons/md";

import { Counter } from "@/components/main-menu/MenuCounter";
import countersStore from "@/store/counterStore";

export const SupportLink = observer(
  ({ className = "" }: { className?: string }) => {
    return (
      <NextLink
        className={buttonVariants({
          variant: "secondary",
          className: `text-foreground dark:text-accent-soft-foreground ${className}`,
        })}
        href="/tickets"
      >
        <MdSupportAgent />
        Поддержка
        <Counter value={countersStore.ticketCounters} />
      </NextLink>
    );
  },
);
