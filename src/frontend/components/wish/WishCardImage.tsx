import { Chip } from "@heroui/react";
import { twMerge } from "tailwind-merge";

import Desirability from "../desirability/DesirabilitySelector";
import { ResponsiveImage } from "../ResponsiveImage";
import { DEFAULT_WISHLIST_EMOJI } from "../wishlist/wishlistAppearance";

import WishStatus from "./WishStatus";

import { CURRENCY_BY_CODE } from "@/lib/currency";
import { IWish } from "@/lib/models/wish";

const CardImage = ({
  wish,
  className,
  iconClassName,
  chipsClassName,
  hideReservedStatus = false,
}: {
  wish: IWish;
  className?: string;
  iconClassName?: string;
  chipsClassName?: string;
  hideReservedStatus?: boolean;
}) => {
  return (
    <div className={twMerge("relative h-full rounded-3xl", className)}>
      <div className="rounded-3xl flex h-full w-full">
        {wish.images?.length ? (
          <ResponsiveImage
            fill
            alt="Изображение карточки желания"
            className="z-0 mx-auto h-full w-full"
            src={wish.images[0]}
          />
        ) : (
          <div className="wish-image-placeholder w-full h-full rounded-3xl">
            <span
              aria-hidden="true"
              className={twMerge(
                "grid place-items-center text-8xl mx-auto my-auto",
                iconClassName,
              )}
            >
              {DEFAULT_WISHLIST_EMOJI}
            </span>
          </div>
        )}
      </div>
      <div className="absolute top-1.5 z-10 flex flex-col items-center w-full">
        <span className="mx-auto">
          <WishStatus hideReserved={hideReservedStatus} size="lg" wish={wish} />
        </span>
      </div>
      <div
        className={twMerge(
          "flex absolute bottom-2 px-3 w-full z-10",
          chipsClassName,
        )}
      >
        {wish.desirability && wish.desirability > 1 ? (
          <Chip
            className="wishlist-card-chip backdrop-blur-lg border"
            size="lg"
          >
            <Desirability onlyRead value={wish.desirability} />
          </Chip>
        ) : null}
        {wish.cost ? (
          <Chip
            className="ml-auto mr-0 wishlist-card-chip backdrop-blur-lg border"
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
