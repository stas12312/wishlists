import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { AiFillGift } from "react-icons/ai";

import Desirability from "../desirability";

import WishlistStatus from "./wishlistStatus";

import { IWish } from "@/lib/models/wish";
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
        className={`bg-gradient-to-br from-default to-default-100 rounded-large w-full flex ${iconClassName}`}
      >
        {wish.image ? (
          <Image
            className="z-0 object-cover h-full w-full mx-auto"
            removeWrapper={removeWrapper}
            src={wish.image}
          />
        ) : (
          <AiFillGift className="text-8xl mx-auto my-auto" />
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
            {wish.cost.toLocaleString() + " ₽"}
          </Chip>
        ) : null}
      </div>
    </div>
  );
};

export default CardImage;
