import { Badge, Link } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

import { Counter } from "./counter";

export interface IMenuItem {
  icon: React.ReactNode;
  title: string;
  href: string;
  counterName?: string;
  selectedIconClassName?: string;
}

export interface IMenuItemParams {
  isCurrent?: boolean;
  counter?: number;
}

export interface IMenuItemProps {
  item: IMenuItem;
  params: IMenuItemParams;
}

export const MobileMenuItem = observer((props: IMenuItemProps) => {
  const item = props.item;
  const params = props.params;
  return (
    <div className="h-full w-full flex justify-center">
      <Badge.Anchor className="h-full w-full" color="primary">
        <Link
          className={clsx(
            "h-full w-full flex flex-col no-underline py-4 rounded-4xl data-[focus-visible=true]:ring-0",
            "data-[focus-visible=true]:shadow-transparent data-[focus-visible=true]:ring-offset-0",
            "data-[focus-visible=true]:text-foreground/50",
          )}
          href={item.href}
        >
          <div
            className={twMerge(
              "text-3xl mx-auto",
              params.isCurrent && item.selectedIconClassName
                ? item.selectedIconClassName
                : "",
            )}
          >
            {item.icon}
          </div>
          <span className="text-[14px]">{item.title}</span>
        </Link>
        {params.counter ? (
          <Badge color="accent" variant="primary">
            {params.counter}
          </Badge>
        ) : null}
      </Badge.Anchor>
    </div>
  );
});

export const DesktopMenuItem = observer(
  ({ item, params }: { item: IMenuItem; params: IMenuItemParams }) => {
    return (
      <Link
        key={item.title}
        className={`w-full flex gap-2 py-1 pl-3 hover:transition-colors rounded-3xl ease-in items-center hover:bg-default-hover text-lg ${params.isCurrent ? "bg-default" : null} no-underline `}
        href={item.href}
      >
        <span
          className={
            params.isCurrent && item.selectedIconClassName
              ? item.selectedIconClassName
              : ""
          }
        >
          {item.icon}
        </span>
        {item.title}
        {item.counterName ? <Counter value={params.counter || 0} /> : ""}
      </Link>
    );
  },
);
