"use client";
import { Badge } from "@nextui-org/badge";
import { Chip } from "@nextui-org/chip";
import { Link } from "@nextui-org/link";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import {
  MdAutoAwesome,
  MdOutlineExitToApp,
  MdPerson,
  MdSettings,
  MdStar,
} from "react-icons/md";
import { usePathname } from "next/navigation";
import { Divider } from "@nextui-org/divider";

import countersStore from "@/store/counterStore";
import userStore from "@/store/userStore";
import { logout } from "@/lib/auth";

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
    icon: <MdSettings />,
    title: "Настройки",
    href: "/settings",
    selectedIconClassName: "text-gray-500",
  },
];

const Menu = observer(({ variant }: { variant: "mobile" | "desktop" }) => {
  const [countersValues, setCounterValues] = useState<Map<string, number>>(
    new Map<string, number>(),
  );

  const pathname = usePathname();
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
      <div className="flex justify-between">
        {ITEMS.map((item) => (
          <MenuItem
            key={item.title}
            counter={
              item.counterName ? countersValues.get(item.counterName) || 0 : 0
            }
            href={item.href}
            icon={item.icon}
            isCurrent={pathname == item.href}
            selectedIconClassName={item.selectedIconClassName}
            title={item.title}
          />
        ))}
      </div>
    );
  } else {
    return (
      <div>
        {ITEMS.map((item) => (
          <Link
            key={item.title}
            disableAnimation
            className={`w-full flex gap-2 p-1 rounded-small hover:transition-colors ease-in items-center hover:bg-default-200 text-lg ${pathname == item.href ? "bg-default" : null}`}
            color="foreground"
            href={item.href}
          >
            <span
              className={
                pathname == item.href && item.selectedIconClassName
                  ? item.selectedIconClassName
                  : ""
              }
            >
              {item.icon}
            </span>
            {item.title}
            {item.counterName ? (
              <Counter value={countersValues.get(item.counterName) || 0} />
            ) : (
              ""
            )}
          </Link>
        ))}
        <Divider className="my-2" />
        <Link
          key="Выход"
          disableAnimation
          className={`w-full flex gap-2 p-1 rounded-small hover:transition-colors ease-in items-center hover:bg-danger-100 text-lg cursor-pointer text-danger`}
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

const MenuItem = ({
  icon,
  title,
  href,
  counter,
  isCurrent,
  selectedIconClassName,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  counter: number;
  isCurrent: boolean;
  selectedIconClassName?: string;
}) => {
  return (
    <div className="h-full w-full p-4 flex justify-center rounded-xl">
      <Badge
        color="primary"
        content={counter}
        isInvisible={counter == 0}
        showOutline={false}
      >
        <Link
          disableAnimation
          className={`flex flex-col `}
          color="foreground"
          href={href}
        >
          <div
            className={`text-3xl mx-auto ${
              isCurrent && selectedIconClassName ? selectedIconClassName : ""
            }`}
          >
            {icon}
          </div>
          <span className="text-tiny">{title}</span>
        </Link>
      </Badge>
    </div>
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
