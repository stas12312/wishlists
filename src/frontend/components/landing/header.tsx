import { AnimatePresence, motion } from "framer-motion";
import { BsStars } from "react-icons/bs";
import { Tab, Tabs } from "@heroui/react";

import { StartButton } from "./startButton";
import { Video } from "./video";

import { defaultVariants } from "@/lib/animations/default";

export const HeaderBlock = () => {
  return (
    <div className="bg-primary-200 dark:bg-primary-100 h-3/4 lg:py-32 p-4 shadow-md relative overflow-hidden">
      <div className="absolute h-32 w-32 md:h-96 md:w-96 bg-primary-500/60 -top-16 -left-16 md:-top-40 md:-left-40 rounded-full blur-3xl" />
      <div className="absolute h-32 w-32 md:h-96 md:w-96 bg-primary-500/60 -bottom-16 -right-16 md:-bottom-40 md:-right-40 rounded-full blur-3xl" />
      <motion.div
        animate="animate"
        className="flex lg:flex-row flex-col max-w-[1200px] mx-auto gap-4"
        initial="initial"
        variants={defaultVariants}
      >
        <div className="flex-col flex text-center my-[10%] gap-2 z-10">
          <span className="flex gap-2 mx-auto text-5xl md:text-6xl">
            <BsStars style={{ color: "gold" }} />
            <h1 className="font-semibold font-mono">MyWishlists</h1>
          </span>

          <h2 className="text-xl md:text-3xl">
            Бесплатный сервис для составления вишлистов
          </h2>
          <StartButton title="Начать прямо сейчас" />
        </div>
        <div className="relative lg:w-2/3 h-[500px] md:h-auto flex items-center flex-col lg:skew-y-3">
          <AnimatePresence>
            <Tabs>
              <Tab title="На ПК">
                <div className="h-[440px] flex flex-col items-center">
                  <Video
                    className="md:h-[440px] my-auto"
                    src="https://cdn.mywishlists.ru/static/landing/videoMainPC.mp4"
                  />
                </div>
              </Tab>
              <Tab title="На телефоне">
                <Video
                  className="h-[440px] mx-auto"
                  src="https://cdn.mywishlists.ru/static/landing/videoMainMobile.mp4"
                />
              </Tab>
            </Tabs>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
