import { Chip, Tooltip } from "@heroui/react";
import { ReactNode } from "react";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";

import { wishlistChipClassName } from "./wishlist/WishlistChips";

import { IWishlist, Visible } from "@/lib/models/wishlist";
import { wishlistVisibility } from "@/lib/wishlistVisibility";

interface IVisibleInfo {
  title: string;
  shortTitle: string;
  icon: ReactNode;
}

const visibleInfo: IVisibleInfo[] = [
  {
    title: "Доступен только мне",
    shortTitle: "Приватный",
    icon: <MdOutlinePublicOff />,
  },
  {
    title: "Доступен всем",
    shortTitle: "Публичный",
    icon: <MdOutlinePublic />,
  },
  {
    title: "Доступен друзьям",
    shortTitle: "Для друзей",
    icon: <MdPerson />,
  },
  {
    title: "Доступен указанным друзьям",
    shortTitle: "Выбранным друзьям",
    icon: <MdPerson />,
  },
];

export const VisibleChip = ({
  wishlist,
  onlyIcon = false,
  short = false,
}: {
  wishlist: IWishlist;
  onlyIcon?: boolean;
  short?: boolean;
}) => {
  const info = getVisibleInfo(wishlist.visible);
  const visibility = wishlistVisibility[wishlist.visible];

  if (onlyIcon) {
    return (
      <Tooltip closeDelay={50} delay={0}>
        <Tooltip.Trigger>
          <Chip className="h-8" color="default" size="lg" variant="primary">
            {info.icon}
          </Chip>
        </Tooltip.Trigger>
        <Tooltip.Content className="text-sm">{info.title}</Tooltip.Content>
      </Tooltip>
    );
  }

  if (short) {
    return (
      <span
        className={`${wishlistChipClassName} max-w-full`}
        title={info.title}
      >
        <span aria-hidden="true" className="shrink-0">
          {visibility.emoji}
        </span>
        <span className="truncate">{info.shortTitle}</span>
      </span>
    );
  }

  return (
    <Chip color="success" size="lg" title={info.title} variant="primary">
      {info.icon}
      <Chip.Label className="min-w-0 truncate">{info.title}</Chip.Label>
    </Chip>
  );
};

function getVisibleInfo(visible: Visible): IVisibleInfo {
  return visibleInfo[visible];
}
