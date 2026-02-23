import { Chip } from "@heroui/chip";
import { ReactNode } from "react";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";
import { Tooltip } from "@heroui/tooltip";

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
      <Tooltip closeDelay={50} content={info.title}>
        <Chip color="default">{info.icon}</Chip>
      </Tooltip>
    );
  } else {
    return (
      <Chip color="success" startContent={info.icon}>
        {info.title}
      </Chip>
    );
  }
};

function getVisibleInfo(visible: Visible): IVisibleInfo {
  return visibleInfo[visible];
}
