"use client";
import { observer } from "mobx-react-lite";

import { DesktopMenuItem, IMenuItemProps, MobileMenuItem } from "./item";

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
        <div className="flex justify-between">
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
