import type { IStatistic } from "../wish/WishList";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import {
  MdOutlineCalendarToday,
  MdOutlineCheck,
  MdOutlineSell,
  MdOutlinePublic,
  MdOutlinePublicOff,
  MdPerson,
} from "react-icons/md";

import { IWishlist, Visible } from "@/lib/models/wishlist";
const visibleLabels: Record<Visible, string> = {
  [Visible.Private]: "только для меня",
  [Visible.Public]: "для всех",
  [Visible.ForFriends]: "для друзей",
  [Visible.ForSelectedFriends]: "для избранных друзей",
};

const visibleIcons: Record<Visible, ReactNode> = {
  [Visible.Private]: <MdOutlinePublicOff className="text-sm" />,
  [Visible.Public]: <MdOutlinePublic className="text-sm" />,
  [Visible.ForFriends]: <MdPerson className="text-sm" />,
  [Visible.ForSelectedFriends]: <MdPerson className="text-sm" />,
};

export function WishlistChips({
  wishlist,
  isOwner,
  statistic,
  className,
}: {
  wishlist: IWishlist;
  isOwner: boolean;
  statistic?: IStatistic;
  className: string;
}) {
  const chips: {
    label: string;
    textClassName: string;
    backgroundClassName: string;
    icon?: ReactNode;
  }[] = [];
  if (wishlist.date) {
    chips.push({
      label: formatEventDate(wishlist.date),
      textClassName: "text-slate-700 dark:text-white/90",
      backgroundClassName: "bg-white/30 dark:bg-white/10",
      icon: <MdOutlineCalendarToday className="text-sm" />,
    });
  }
  if (isOwner && wishlist.is_active) {
    chips.push({
      label: visibleLabels[wishlist.visible],
      textClassName: "text-slate-900 dark:text-white",
      backgroundClassName: "bg-white/30 dark:bg-white/10",
      icon: visibleIcons[wishlist.visible],
    });
  }
  if (isOwner && statistic?.totalCount) {
    chips.push({
      label: `исполнено ${statistic.fullfiledCount} из ${statistic.totalCount}`,
      textClassName: "text-green-800 dark:text-green-200",
      backgroundClassName: "bg-green-100/40 dark:bg-green-200/15",
      icon: <MdOutlineCheck className="text-sm" />,
    });
  }
  if (isOwner && statistic?.totalSum) {
    chips.push({
      label: `на сумму ${statistic.totalSum.toLocaleString()}`,
      textClassName: "text-amber-900 dark:text-amber-200",
      backgroundClassName: "bg-amber-100/40 dark:bg-amber-200/15",
      icon: <MdOutlineSell className="text-sm" />,
    });
  }

  return chips.length ? (
    <motion.div
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      className={"flex flex-wrap items-center gap-2 " + className}
      initial={{ opacity: 0 }}
    >
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm backdrop-blur-sm ${chip.backgroundClassName} ${chip.textClassName}`}
        >
          {chip.icon}
          {chip.label}
        </span>
      ))}
    </motion.div>
  ) : null;
}
function formatEventDate(date: string): string {
  const eventDate = new Date(date);
  const isCurrentYear = eventDate.getFullYear() === new Date().getFullYear();
  return eventDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: isCurrentYear ? undefined : "numeric",
  });
}
