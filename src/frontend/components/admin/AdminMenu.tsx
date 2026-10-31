"use client";
import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";

import { MainMenu } from "../main-menu/Menu";

import { AdminMenuItems } from "./adminMenuItems";

export const AdminMenu = observer(
  ({ variant }: { variant: "mobile" | "desktop" }) => {
    const pathname = usePathname();

    const itemsProps = AdminMenuItems.map((item) => ({
      item: item,
      params: {
        counter: 0,
        isCurrent: pathname == item.href,
      },
    }));

    if (variant == "mobile") {
      return (
        <div className="bg-white/50 dark:bg-default/50 backdrop-blur-xl fixed inset-x-0 bottom-0 z-50 shadow-md my-4 mx-2 rounded-4xl md:hidden inset-shadow-md ring-1 ring-gray-500/20">
          <MainMenu itemsProps={itemsProps} variant="mobile" />
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-default/50 backdrop-blur-xl shadow-md m-2 rounded-3xl overflow-hidden p-1">
        <MainMenu itemsProps={itemsProps} variant="desktop" />
      </div>
    );
  },
);
