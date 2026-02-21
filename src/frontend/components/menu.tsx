"use client";
import { Link } from "@heroui/link";
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
import { Divider } from "@heroui/divider";

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
      return isEvent(message, WSEvent.ChangeIncomingFriendsRequests);
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
      new Map([["requests", countersStore.friendCounters.incoming_requests]]),
    );
  }, [countersStore.friendCounters]);

  if (variant == "mobile") {
    return (
      <div className="flex justify-between">
        {ITEMS.map((item) => (
          <MobileMenuItem
            key={item.title}
            item={item}
            params={{
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
      <div>
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
        <Divider className="my-2" />
        <Link
          key="Выход"
          disableAnimation
          className="w-full flex gap-2 p-1 rounded-small hover:transition-colors ease-in items-center hover:bg-danger-100 text-lg cursor-pointer text-danger"
          color="foreground"
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
