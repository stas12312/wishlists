import {
  MdOutlineArticle,
  MdOutlineMail,
  MdOutlineStorefront,
  MdOutlineSupport,
  MdOutlinePeople,
} from "react-icons/md";

import { IMenuItem } from "../main-menu/MenuItem";

export const AdminMenuItems: IMenuItem[] = [
  {
    title: "Пользователи",
    href: "/admin/users",
    icon: <MdOutlinePeople />,
    selectedIconClassName: "text-violet-500",
  },
  {
    title: "Статьи",
    href: "/admin/articles",
    icon: <MdOutlineArticle />,
    selectedIconClassName: "text-red-500",
  },
  {
    title: "Поддержка",
    href: "/admin/tickets",
    icon: <MdOutlineSupport />,
    selectedIconClassName: "text-pink-500",
  },
  {
    title: "Письма",
    href: "/admin/mails",
    icon: <MdOutlineMail />,
    selectedIconClassName: "text-blue-500",
  },
  {
    title: "Парсинг",
    href: "/admin/parse",
    icon: <MdOutlineStorefront />,
    selectedIconClassName: "text-green-500",
  },
];
