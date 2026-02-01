import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { AiFillGift } from "react-icons/ai";

import Desirability from "../desirability";

import WishlistStatus from "./wishlistStatus";

import { IWish } from "@/lib/models/wish";
import { CURRENCY_BY_CODE } from "@/lib/currency";
const CardImage = ({
  wish,
  removeWrapper,
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
            className="z-0 object-cover h-full w-full mx-auto"
            removeWrapper={removeWrapper}
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
          <Chip>
            <Desirability onlyRead value={wish.desirability} />
          </Chip>
        ) : null}
        {wish.cost ? (
          <Chip className="ml-auto mr-0">
            {wish.cost.toLocaleString() +
              ` ${CURRENCY_BY_CODE.get(wish.currency)?.symbol || CURRENCY_BY_CODE.get("RUB")?.symbol}`}
          </Chip>
        ) : null}
      </div>
    </div>
  );
};

export default CardImage;
