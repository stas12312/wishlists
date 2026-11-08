import { Visible } from "@/lib/models/wishlist";

export const wishlistVisibility: Record<
  Visible,
  { label: string; emoji: string }
> = {
  [Visible.Private]: { label: "Приватный", emoji: "🔒" },
  [Visible.Public]: { label: "Публичный", emoji: "🌍" },
  [Visible.ForFriends]: { label: "Доступен друзьям", emoji: "👥" },
  [Visible.ForSelectedFriends]: {
    label: "Доступен выбранным друзьям",
    emoji: "⭐",
  },
};
