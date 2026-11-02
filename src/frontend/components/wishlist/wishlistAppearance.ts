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

type WishlistOgPalette = {
  background: string;
  edge: string;
  emojiBackground: string;
};

export const WISHLIST_OG_COLORS = {
  sky: {
    light: {
      background: "#E0F2FE",
      edge: "rgba(14, 116, 144, 0.16)",
      emojiBackground: "#BAE6FD",
    },
    dark: {
      background: "#082F49",
      edge: "rgba(14, 116, 144, 0.32)",
      emojiBackground: "#0EA5E9",
    },
  },
  violet: {
    light: {
      background: "#F3E8FF",
      edge: "rgba(126, 34, 206, 0.16)",
      emojiBackground: "#DDD6FE",
    },
    dark: {
      background: "#2E1065",
      edge: "rgba(126, 34, 206, 0.32)",
      emojiBackground: "#8B5CF6",
    },
  },
  rose: {
    light: {
      background: "#FFE4E6",
      edge: "rgba(190, 18, 60, 0.16)",
      emojiBackground: "#FECDD3",
    },
    dark: {
      background: "#4C0519",
      edge: "rgba(190, 18, 60, 0.32)",
      emojiBackground: "#F43F5E",
    },
  },
  teal: {
    light: {
      background: "#CCFBF1",
      edge: "rgba(13, 148, 136, 0.16)",
      emojiBackground: "#99F6E4",
    },
    dark: {
      background: "#134E4A",
      edge: "rgba(13, 148, 136, 0.32)",
      emojiBackground: "#14B8A6",
    },
  },
  orange: {
    light: {
      background: "#FFEDD5",
      edge: "rgba(194, 65, 12, 0.16)",
      emojiBackground: "#FED7AA",
    },
    dark: {
      background: "#431407",
      edge: "rgba(194, 65, 12, 0.32)",
      emojiBackground: "#F97316",
    },
  },
  fuchsia: {
    light: {
      background: "#FAE8FF",
      edge: "rgba(162, 28, 175, 0.16)",
      emojiBackground: "#F5D0FE",
    },
    dark: {
      background: "#4A044E",
      edge: "rgba(162, 28, 175, 0.32)",
      emojiBackground: "#D946EF",
    },
  },
  graphite: {
    light: {
      background: "#E4E4E7",
      edge: "rgba(63, 63, 70, 0.16)",
      emojiBackground: "#D4D4D8",
    },
    dark: {
      background: "#18181B",
      edge: "rgba(82, 82, 91, 0.32)",
      emojiBackground: "#71717A",
    },
  },
} satisfies Record<
  (typeof WISHLIST_COLORS)[number]["id"],
  { light: WishlistOgPalette; dark: WishlistOgPalette }
>;

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
