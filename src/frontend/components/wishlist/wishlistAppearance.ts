export const DEFAULT_WISHLIST_EMOJI = "🎁";

const AUTO_COLORS = [
  {
    id: "sky",
    label: "Голубой",
    gradient: "from-sky-200 to-blue-300 dark:from-sky-400 dark:to-blue-950",
    swatch: "bg-sky-400",
    accent: "wishlist-accent-sky",
  },
  {
    id: "violet",
    label: "Фиолетовый",
    gradient:
      "from-violet-200 to-indigo-300 dark:from-violet-500 dark:to-indigo-950",
    swatch: "bg-violet-500",
    accent: "wishlist-accent-violet",
  },
  {
    id: "rose",
    label: "Розовый",
    gradient: "from-rose-200 to-rose-300 dark:from-rose-400 dark:to-rose-950",
    swatch: "bg-rose-400",
    accent: "wishlist-accent-rose",
  },
  {
    id: "teal",
    label: "Бирюзовый",
    gradient: "from-teal-200 to-cyan-300 dark:from-teal-400 dark:to-cyan-950",
    swatch: "bg-teal-400",
    accent: "wishlist-accent-teal",
  },
  {
    id: "orange",
    label: "Оранжевый",
    gradient:
      "from-orange-200 to-amber-300 dark:from-orange-400 dark:to-amber-950",
    swatch: "bg-orange-400",
    accent: "wishlist-accent-orange",
  },
  {
    id: "fuchsia",
    label: "Сиреневый",
    gradient:
      "from-fuchsia-200 to-purple-300 dark:from-fuchsia-400 dark:to-purple-950",
    swatch: "bg-fuchsia-400",
    accent: "wishlist-accent-fuchsia",
  },
] as const;

export const WISHLIST_COLORS = [
  ...AUTO_COLORS,
  {
    id: "graphite",
    label: "Графитовый",
    gradient: "from-zinc-200 to-zinc-300 dark:from-zinc-500 dark:to-zinc-950",
    swatch: "bg-zinc-600",
    accent: "wishlist-accent-graphite",
  },
] as const;

export const DEFAULT_WISHLIST_COLOR = WISHLIST_COLORS[0].id;

export const WISHLIST_EMOJIS = [
  "🎁",
  "🎮",
  "🎧",
  "🎸",
  "📚",
  "✈️",
  "🚗",
  "🏠",
  "👕",
  "💄",
  "⚽",
  "🍰",
];

function getWishlistColor(_uuid: string, color?: string) {
  const selectedColor = WISHLIST_COLORS.find((item) => item.id === color);
  if (selectedColor) {
    return selectedColor;
  }

  return WISHLIST_COLORS[0];
}

export function getWishlistGradient(uuid: string, color?: string): string {
  return getWishlistColor(uuid, color).gradient;
}

export function getWishlistAccent(uuid: string, color?: string): string {
  return getWishlistColor(uuid, color).accent;
}
