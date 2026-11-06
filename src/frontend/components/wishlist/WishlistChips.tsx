import type { IStatistic } from "../wish/WishList";

import { motion } from "framer-motion";

import { IWishlist, Visible } from "@/lib/models/wishlist";

export const wishlistChipClassName =
  "inline-flex items-center gap-1.5 rounded-full bg-white/30 px-3 py-1 text-sm font-medium text-slate-900 backdrop-blur-sm dark:bg-white/10 dark:text-white";

const visibleLabels: Record<Visible, string> = {
  [Visible.Private]: "только для меня",
  [Visible.Public]: "Публичный",
  [Visible.ForFriends]: "для друзей",
  [Visible.ForSelectedFriends]: "для выбранных друзей",
};

const visibleEmoji: Record<Visible, string> = {
  [Visible.Private]: "🔒",
  [Visible.Public]: "🌍",
  [Visible.ForFriends]: "👥",
  [Visible.ForSelectedFriends]: "⭐",
};

export function WishlistTypeChip({ forOther }: { forOther?: boolean }) {
  const label = forOther ? "Для другого" : "Для себя";

  return (
    <span className={`${wishlistChipClassName} shrink-0`}>
      <span aria-hidden="true">{forOther ? "👨‍👩‍👧" : "🙋"}</span>
      {label}
    </span>
  );
}

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
    emoji: string;
  }[] = [];
  if (wishlist.date) {
    chips.push({
      label: formatEventDate(wishlist.date),
      textClassName: "text-slate-700 dark:text-white/90",
      backgroundClassName: "bg-white/30 dark:bg-white/10",
      emoji: "📅",
    });
  }
  if (isOwner && wishlist.is_active) {
    chips.push({
      label: visibleLabels[wishlist.visible],
      textClassName: "text-slate-900 dark:text-white",
      backgroundClassName: "bg-white/30 dark:bg-white/10",
      emoji: visibleEmoji[wishlist.visible],
    });
  }
  if (!isOwner && wishlist.settings?.for_other) {
    chips.push({
      label: "Автор видит, какие подарки забронированы",
      textClassName: "text-slate-900 dark:text-white",
      backgroundClassName: "bg-white/30 dark:bg-white/10",
      emoji: "👀",
    });
  }
  if (isOwner && !wishlist.settings?.for_other) {
    chips.push({
      label: "Бронирования скрыты, чтобы сохранить сюрприз",
      textClassName: "text-slate-900 dark:text-white",
      backgroundClassName: "bg-white/30 dark:bg-white/10",
      emoji: "🙈",
    });
  }
  if (isOwner && statistic?.totalCount) {
    chips.push({
      label: `исполнено ${statistic.fullfiledCount} из ${statistic.totalCount}`,
      textClassName: "text-green-800 dark:text-green-200",
      backgroundClassName: "bg-green-100/40 dark:bg-green-200/15",
      emoji: "✅",
    });
  }
  if (isOwner && statistic?.totalSum) {
    chips.push({
      label: `на сумму ${statistic.totalSum.toLocaleString()}`,
      textClassName: "text-amber-900 dark:text-amber-200",
      backgroundClassName: "bg-amber-100/40 dark:bg-amber-200/15",
      emoji: "💰",
    });
  }

  return (
    <motion.div
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      className={"flex flex-wrap items-center gap-2 " + className}
      initial={{ opacity: 0 }}
    >
      <WishlistTypeChip forOther={wishlist.settings?.for_other} />
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm backdrop-blur-sm ${chip.backgroundClassName} ${chip.textClassName}`}
        >
          <span aria-hidden="true" className="shrink-0">
            {chip.emoji}
          </span>
          {chip.label}
        </span>
      ))}
    </motion.div>
  );
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
