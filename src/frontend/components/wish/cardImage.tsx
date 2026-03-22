import { Chip } from "@heroui/react";
import Image from "next/image";
import { AiFillGift } from "react-icons/ai";

import Desirability from "../desirability";

import WishlistStatus from "./wishlistStatus";

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
    <div className={`relative ${className}`}>
      <div
        className={`bg-linear-to-br from-default to-default-100 rounded-large w-full flex h-full`}
      >
        {wish.images?.length ? (
          <Image
            unoptimized
            alt="Изображение карточки желания"
            className="z-0 object-cover h-full w-full mx-auto"
            fill={true}
            sizes="auto, auto"
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
      <div className="flex absolute bottom-1.5 px-1 w-full z-10">
        {wish.desirability && wish.desirability > 1 ? (
          <Chip size="lg">
            <Desirability onlyRead value={wish.desirability} />
          </Chip>
        ) : null}
        {wish.cost ? (
          <Chip className="ml-auto mr-0" size="lg">
            {wish.cost.toLocaleString() +
              ` ${CURRENCY_BY_CODE.get(wish.currency)?.symbol || CURRENCY_BY_CODE.get("RUB")?.symbol}`}
          </Chip>
        ) : null}
      </div>
    </div>
  );
};

export default CardImage;
