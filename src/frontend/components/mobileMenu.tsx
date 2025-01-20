"use client";
import { Link } from "@nextui-org/link";
import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Badge } from "@nextui-org/badge";
import {
  MdViewList,
  MdPerson,
  MdSettings,
  MdStar,
  MdOutlineExitToApp,
} from "react-icons/md";
import { Chip } from "@nextui-org/chip";

import countersStore from "@/store/counterStore";
import userStore from "@/store/userStore";
import { logout } from "@/lib/auth";

const ITEMS: {
  icon: React.ReactNode;
  title: string;
  href: string;
  counterName?: string;
}[] = [
  {
    icon: <MdViewList />,
    title: "Вишлисты",
    href: "/",
  },
  {
    icon: <MdStar />,
    title: "Желания",
    href: "wishes",
  },
  {
    icon: <MdPerson />,
    title: "Друзья",
    href: "/friends",
    counterName: "requests",
  },

  {
    icon: <MdSettings />,
    title: "Настройки",
    href: "/settings",
  },
];

const Menu = observer(({ variant }: { variant: "mobile" | "desktop" }) => {
  const [countersValues, setCounterValues] = useState<Map<string, number>>(
    new Map<string, number>(),
  );
  useEffect(() => {
    async function fetchData() {
      countersStore.getCounters();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setCounterValues(
      new Map([["requests", countersStore.friendCounters.incoming_requests]]),
    );
  }, [countersStore.friendCounters]);

  if (variant == "mobile") {
    return (
      <div className="flex justify-between p-4">
        {ITEMS.map((item) => (
          <MenuItem
            key={item.title}
            counter={
              item.counterName ? countersValues.get(item.counterName) || 0 : 0
            }
            href={item.href}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </div>
    );
  } else {
    return (
      <Listbox aria-label="menu">
        <ListboxSection showDivider>
          {ITEMS.map((item) => (
            <ListboxItem
              key={item.title}
              className="h-[34px] mx-auto"
              href={item.href}
            >
              <span className="px-2 items-center flex justify-normal gap-2">
                {item.icon} {item.title}{" "}
                {item.counterName ? (
                  <Counter value={countersValues.get(item.counterName) || 0} />
                ) : (
                  ""
                )}
              </span>
            </ListboxItem>
          ))}
        </ListboxSection>
        <ListboxSection>
          <ListboxItem
            key="logout"
            className="text-danger"
            onPress={() => {
              userStore.logout();
              logout();
            }}
          >
            <span className="px-2 items-center flex justify-normal gap-2">
              {<MdOutlineExitToApp />} Выход
            </span>
          </ListboxItem>
        </ListboxSection>
      </Listbox>
    );
  }
});

const MenuItem = ({
  icon,
  title,
  href,
  counter,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  counter: number;
}) => {
  return (
    <Badge
      color="primary"
      content={counter}
      isInvisible={counter == 0}
      showOutline={false}
    >
      <Link className="flex flex-col" color="foreground" href={href}>
        <div className="text-3xl mx-auto">{icon}</div>
        <span className="text-tiny">{title}</span>
      </Link>
    </Badge>
  );
};

const Counter = ({ value }: { value: number }) => {
  return value ? (
    <Chip className="my-auto" color="primary" radius="sm" size="sm">
      {value.toLocaleString()}
    </Chip>
  ) : (
    ""
  );
};

export default Menu;
