import { Badge } from "@heroui/badge";
import { Link } from "@heroui/link";
import { observer } from "mobx-react-lite";

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
    <div className="h-full w-full p-4 flex justify-center rounded-xl">
      <Badge
        color="primary"
        content={params.counter}
        isInvisible={params.counter == 0}
        showOutline={false}
      >
        <Link
          disableAnimation
          className={`flex flex-col `}
          color="foreground"
          href={item.href}
        >
          <div
            className={`text-3xl mx-auto ${
              params.isCurrent && item.selectedIconClassName
                ? item.selectedIconClassName
                : ""
            }`}
          >
            {item.icon}
          </div>
          <span className="text-tiny">{item.title}</span>
        </Link>
      </Badge>
    </div>
  );
});

export const DesktopMenuItem = observer(
  ({ item, params }: { item: IMenuItem; params: IMenuItemParams }) => {
    return (
      <Link
        key={item.title}
        disableAnimation
        className={`w-full flex gap-2 p-1 rounded-small hover:transition-colors ease-in items-center hover:bg-default-200 text-lg ${params.isCurrent ? "bg-default" : null}`}
        color="foreground"
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
