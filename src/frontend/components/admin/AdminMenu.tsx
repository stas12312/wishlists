"use client";
import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";

import { MainMenu } from "../main-menu/Menu";

import { AdminMenuItems } from "./adminMenuItems";

export const AdminMenu = observer(() => {
  const pathname = usePathname();

  return (
    <MainMenu
      itemsProps={AdminMenuItems.map((item) => ({
        item: item,
        params: {
          counter: 0,
          isCurrent: pathname == item.href,
        },
      }))}
      variant="desktop"
    />
  );
});
