"use client";
import { Link, Separator } from "@heroui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import {
  MdAutoAwesome,
  MdEventNote,
  MdOutlineExitToApp,
  MdPerson,
  MdStar,
} from "react-icons/md";
import { usePathname } from "next/navigation";

import { DesktopMenuItem, MobileMenuItem } from "./main-menu/item";

import countersStore from "@/store/counterStore";
import userStore from "@/store/userStore";
import { logout } from "@/lib/auth";
import { defaultParams, getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";

const ITEMS: {
  icon: React.ReactNode;
  title: string;
  href: string;
  counterName?: string;
  selectedIconClassName?: string;
}[] = [
  {
    icon: <MdAutoAwesome />,
    title: "Вишлисты",
    href: "/",
    selectedIconClassName: "text-yellow-500",
  },
  {
    icon: <MdStar />,
    title: "Желания",
    href: "/wishes",
    counterName: "questions",
    selectedIconClassName: "text-yellow-500",
  },
  {
    icon: <MdPerson />,
    title: "Друзья",
    href: "/friends",
    counterName: "requests",
    selectedIconClassName: "text-primary",
  },
  {
    icon: <MdEventNote />,
    title: "Лента",
    href: "/feed",
    selectedIconClassName: "text-red-500",
  },
];

const Menu = observer(({ variant }: { variant: "mobile" | "desktop" }) => {
  const [countersValues, setCounterValues] = useState<Map<string, number>>(
    new Map<string, number>(),
  );

  const { lastJsonMessage } = useWebSocket(getWebsocketUrl, {
    ...defaultParams,
    filter: (message) => {
      return (
        isEvent(message, WSEvent.ChangeIncomingFriendsRequests) ||
        isEvent(message, WSEvent.ChangeQuestionCount)
      );
    },
  });

  const pathname = usePathname();
  useEffect(() => {
    async function fetchData() {
      countersStore.getCounters();
    }
    fetchData();
  }, [lastJsonMessage]);

  useEffect(() => {
    setCounterValues(
      new Map([
        ["requests", countersStore.friendCounters.incoming_requests],
        ["questions", countersStore.totalQuestions],
      ]),
    );
  }, [countersStore.questionCounters, countersStore.friendCounters]);

  if (variant == "mobile") {
    return (
      <div className="flex justify-between bg-white/50  dark:bg-default/50 backdrop-blur-xl fixed inset-x-0 bottom-0 z-50 shadow-medium my-4 mx-2 rounded-4xl md:hidden inset-shadow-md ring-1 ring-gray-500/20">
        {ITEMS.map((item) => (
          <MobileMenuItem
            key={item.title}
            item={item}
            params={{
              isCurrent: pathname == item.href,
              counter: item.counterName
                ? countersValues.get(item.counterName) || 0
                : 0,
            }}
          />
        ))}
      </div>
    );
  } else {
    return (
      <div className="bg-white dark:bg-default/50 backdrop-blur-xl shadow-medium m-2 rounded-2xl overflow-hidden p-1 ring ring-gray-500/30">
        {ITEMS.map((item) => (
          <DesktopMenuItem
            key={item.title}
            item={item}
            params={{
              isCurrent: pathname == item.href,
              counter: item.counterName
                ? countersValues.get(item.counterName) || 0
                : 0,
            }}
          />
        ))}
        <Separator className="my-2" />
        <Link
          key="Выход"
          className="w-full flex gap-2 py-1 pl-3 rounded-xl ease-in items-center hover:bg-danger-soft-hover text-lg cursor-pointer text-danger  no-underline "
          onPress={() => {
            userStore.logout();
            logout();
          }}
        >
          <span>
            <MdOutlineExitToApp />
          </span>
          Выход
        </Link>
      </div>
    );
  }
});

export default Menu;
