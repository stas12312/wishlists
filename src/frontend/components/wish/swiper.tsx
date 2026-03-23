import { Chip } from "@heroui/react";
import { AiFillGift } from "react-icons/ai";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import Desirability from "../desirability";
import { ResponsiveImage } from "../responsive-image";

import WishlistStatus from "./wishlistStatus";

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
          <WishlistStatus size="lg" wish={wish} />
        </span>
      </div>
      <div
        className={`bg-linear-to-br from-default to-default-100 rounded-large w-full flex h-full rounded-3xl`}
      >
        {wish.images?.length ? (
          <Swiper
            navigation
            autoHeight={true}
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
                  <div className="flex justify-center">
                    <ResponsiveImage
                      className="object-cover  rounded-3xl"
                      src={image}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <AiFillGift className={`text-8xl mx-auto my-auto h-64`} />
        )}
      </div>

      <div className="flex bottom-1.5 px-1 w-full absolute z-10">
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
