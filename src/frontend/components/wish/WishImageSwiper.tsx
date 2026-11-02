import { Chip } from "@heroui/react";
import clsx from "clsx";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import Desirability from "../desirability/DesirabilitySelector";
import { ResponsiveImage } from "../ResponsiveImage";
import { DEFAULT_WISHLIST_EMOJI } from "../wishlist/wishlistAppearance";

import WishStatus from "./WishStatus";

import { CURRENCY_BY_CODE } from "@/lib/currency";
import { IWish } from "@/lib/models/wish";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const ImageSwiper = ({ wish }: { wish: IWish }) => {
  return (
    <div className="relative">
      <div className="flex flex-col items-center w-full absolute z-10 mt-1">
        <span className="mx-auto">
          <WishStatus size="lg" wish={wish} />
        </span>
      </div>
      <div
        className={clsx(
          "w-full flex h-full rounded-3xl",
          wish.images?.length
            ? "bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f8_35%,#ececee_100%)] dark:bg-[linear-gradient(180deg,#1c1c1e_0%,#2c2c2e_40%,#3a3a3c_100%)]"
            : "wish-image-placeholder",
        )}
      >
        {wish.images?.length ? (
          <Swiper
            navigation
            centeredSlides={true}
            className="w-full m-auto"
            modules={[Navigation]}
            scrollbar={{ draggable: true }}
            slidesPerView={1}
            spaceBetween={4}
          >
            {wish.images.map((image) => {
              return (
                <SwiperSlide key={image}>
                  <ResponsiveImage
                    fill
                    className="w-full aspect-square"
                    imageClassName="object-contain"
                    src={image}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <span
            aria-hidden="true"
            className={`grid place-items-center text-8xl mx-auto my-auto h-64`}
          >
            {DEFAULT_WISHLIST_EMOJI}
          </span>
        )}
      </div>

      <div className="flex bottom-2 px-3 w-full absolute z-10">
        {wish.desirability && wish.desirability > 1 ? (
          <Chip className="bg-default/60  backdrop-blur-lg" size="lg">
            <Desirability onlyRead value={wish.desirability} />
          </Chip>
        ) : null}
        {wish.cost ? (
          <Chip
            className="ml-auto mr-0 bg-default/60 backdrop-blur-lg"
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
