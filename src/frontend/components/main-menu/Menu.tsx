"use client";
import { observer } from "mobx-react-lite";

import { DesktopMenuItem, IMenuItemProps, MobileMenuItem } from "./MenuItem";

export const MainMenu = observer(
  ({
    variant,
    itemsProps,
  }: {
    variant: "mobile" | "desktop";
    itemsProps: IMenuItemProps[];
  }) => {
    if (variant == "mobile") {
      return (
        <div className="flex justify-between overflow-x-auto rounded-full [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%_-_24px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>div]:min-w-max [&>div]:shrink-0 [&>div]:px-3">
          {itemsProps.map((itemProps) => (
            <MobileMenuItem key={itemProps.item.title} {...itemProps} />
          ))}
        </div>
      );
    } else {
      return (
        <div>
          {itemsProps.map((itemProps) => (
            <DesktopMenuItem key={itemProps.item.title} {...itemProps} />
          ))}
        </div>
      );
    }
  },
);
