import { Chip } from "@heroui/react";
import { AiFillGift } from "react-icons/ai";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

import Desirability from "../desirability/DesirabilitySelector";
import { ResponsiveImage } from "../ResponsiveImage";

import WishlistStatus from "./WishlistStatus";

import { CURRENCY_BY_CODE } from "@/lib/currency";
import { IWish } from "@/lib/models/wish";

const CardImage = ({
  wish,
  className,
  iconClassName,
}: {
  wish: IWish;
  removeWrapper?: boolean;
  className?: string;
  iconClassName?: string;
}) => {
  return (
    <div className={twMerge("relative h-full  rounded-3xl", className)}>
      <div
        className={clsx(
          "rounded-3xl flex h-full w-full",
          "bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f8_35%,#ececee_100%)]",
          "dark:bg-[linear-gradient(180deg,#1c1c1e_0%,#2c2c2e_40%,#3a3a3c_100%)]",
        )}
      >
        {wish.images?.length ? (
          <ResponsiveImage
            alt="Изображение карточки желания"
            className="z-0 object-cover mx-auto h-full w-full"
            src={wish.images[0]}
          />
        ) : (
          <AiFillGift className={`text-8xl mx-auto my-auto ${iconClassName}`} />
        )}
      </div>
      <div className="absolute top-1.5 flex flex-col items-center w-full">
        <span className="mx-auto">
          <WishlistStatus size="lg" wish={wish} />
        </span>
      </div>
      <div className="flex absolute bottom-2 px-3 w-full z-10">
        {wish.desirability && wish.desirability > 1 ? (
          <Chip
            className="bg-default/60 backdrop-blur-lg border border-gray-500/30"
            size="lg"
          >
            <Desirability onlyRead value={wish.desirability} />
          </Chip>
        ) : null}
        {wish.cost ? (
          <Chip
            className="ml-auto mr-0 bg-default/60 backdrop-blur-lg border border-gray-500/30"
            size="lg"
          >
            {wish.cost.toLocaleString() +
              ` ${CURRENCY_BY_CODE.get(wish.currency)?.symbol || CURRENCY_BY_CODE.get("RUB")?.symbol}`}
          </Chip>
        ) : null}
      </div>
    </div>
  );
};

export default CardImage;
