"use client";
import { MdOutlineArticle, MdOutlineStarBorder } from "react-icons/md";
import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";

import { MainMenu } from "../main-menu/menu";
import { IMenuItem } from "../main-menu/item";

const AdminMenuItems: IMenuItem[] = [
  {
    title: "Главная",
    href: "/admin",
    icon: <MdOutlineStarBorder />,
    selectedIconClassName: "text-yellow-500",
  },
  {
    title: "Статьи",
    href: "/admin/articles",
    icon: <MdOutlineArticle />,
    selectedIconClassName: "text-red-500",
  },
];

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
