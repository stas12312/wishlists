import { Chip, Tooltip } from "@heroui/react";
import { ReactNode } from "react";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";

import { IWishlist, Visible } from "@/lib/models/wishlist";

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
  } else {
    return (
      <Chip
        className={
          short
            ? "h-8 max-w-full bg-black/5 text-slate-800 backdrop-blur-sm dark:bg-black/15 dark:text-white"
            : undefined
        }
        color={short ? "default" : "success"}
        size="lg"
        title={info.title}
        variant="primary"
      >
        {info.icon}
        <Chip.Label className="min-w-0 truncate">
          {short ? info.shortTitle : info.title}
        </Chip.Label>
      </Chip>
    );
  }
};

function getVisibleInfo(visible: Visible): IVisibleInfo {
  return visibleInfo[visible];
}
