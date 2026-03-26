import { Chip, Tooltip } from "@heroui/react";
import { ReactNode } from "react";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";

import { IWishlist, Visible } from "@/lib/models/wishlist";

interface IVisibleInfo {
  title: string;
  icon: ReactNode;
}

const visibleInfo: IVisibleInfo[] = [
  {
    title: "Доступен только мне",
    icon: <MdOutlinePublicOff />,
  },
  {
    title: "Доступен всем",
    icon: <MdOutlinePublic />,
  },
  {
    title: "Доступен друзьям",
    icon: <MdPerson />,
  },
  {
    title: "Доступен указанным друзьям",
    icon: <MdPerson />,
  },
];

export const VisibleChip = ({
  wishlist,
  onlyIcon = false,
}: {
  wishlist: IWishlist;
  onlyIcon?: boolean;
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
      <Chip color="success" size="lg" variant="primary">
        {info.icon}
        {info.title}
      </Chip>
    );
  }
};

function getVisibleInfo(visible: Visible): IVisibleInfo {
  return visibleInfo[visible];
}
