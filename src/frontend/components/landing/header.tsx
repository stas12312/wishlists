import { AnimatePresence, motion } from "framer-motion";
import { BsStars } from "react-icons/bs";
import { Tab, Tabs } from "@heroui/tabs";
import { MdOutlineDesktopMac, MdOutlineSmartphone } from "react-icons/md";
import { ReactNode, useEffect, useState } from "react";

import { StartButton } from "./startButton";
import { Video } from "./video";

import { defaultVariants } from "@/lib/animations/default";

export const HeaderBlock = () => {
  const [activeTab, setActiveTab] = useState("desktop");

  useEffect(() => {
    setActiveTab(window.innerWidth <= 768 ? "mobile" : "desktop");
  }, []);

  return (
    <div className="bg-primary-200 dark:bg-primary-100 h-3/4 lg:py-32 p-4 shadow-xl relative overflow-hidden rounded-3xl -mx-4 md:mx-0">
      <div className="absolute h-32 w-32 md:h-96 md:w-96 bg-primary-500/60 -top-16 -left-16 md:-top-40 md:-left-40 rounded-full blur-3xl" />
      <div className="absolute h-32 w-32 md:h-96 md:w-96 bg-primary-500/60 -bottom-16 -right-16 md:-bottom-40 md:-right-40 rounded-full blur-3xl" />
      <motion.div className="flex lg:flex-row flex-col max-w-[1200px] mx-auto gap-4">
        <motion.div
          animate={{
            opacity: 1,
            transform: "translateX(0)",
            transition: { duration: 0.8 },
          }}
          className="flex-col flex text-center my-[10%] gap-2 z-10"
          initial={{
            opacity: 0,
            transform: "translateX(-20px)",
          }}
        >
          <span className="flex gap-2 mx-auto text-5xl md:text-6xl">
            <BsStars style={{ color: "gold" }} />
            <h1 className="font-semibold">MyWishlists</h1>
          </span>

          <h2 className="text-xl md:text-3xl">
            Бесплатный сервис для составления вишлистов
          </h2>
          <StartButton
            className="hidden lg:block"
            title="Начать прямо сейчас"
          />
        </motion.div>
        <span className="md:skew-y-3 h-[500px] lg:w-2/3 lg:h-auto">
          <motion.div
            animate={{
              opacity: 1,
              transform: "translateX(0)",
              transition: { duration: 0.8 },
            }}
            className="relative w-full h-full flex items-center flex-col"
            initial={{
              opacity: 0,
              transform: "translateX(20px)",
            }}
          >
            <Tabs
              color="primary"
              radius="lg"
              selectedKey={activeTab}
              size="lg"
              variant="solid"
              onSelectionChange={(key) => setActiveTab(key.toString())}
            >
              <Tab
                key="desktop"
                title={<MdOutlineDesktopMac className="text-2xl" />}
              />
              <Tab
                key="mobile"
                title={<MdOutlineSmartphone className="text-2xl" />}
              />
            </Tabs>
            <AnimatePresence>
              {activeTab == "desktop" ? (
                <AnimatedDiv
                  key="desktop"
                  className="max-h-[440px] absolute top-14 "
                >
                  <Video
                    className="my-auto max-h-[440px]"
                    posterSrc="https://cdn.mywishlists.ru/static/landing/light/desktopPreload.jpg"
                    src="https://cdn.mywishlists.ru/static/landing/light/videoMainPC.mp4"
                  />
                </AnimatedDiv>
              ) : (
                <AnimatedDiv key="mobile" className="absolute top-14">
                  <Video
                    className="h-[440px] mx-auto"
                    posterSrc="https://cdn.mywishlists.ru/static/landing/light/mobilePreload.jpg"
                    src="https://cdn.mywishlists.ru/static/landing/light/videoMainMobile.mp4"
                  />
                </AnimatedDiv>
              )}
            </AnimatePresence>
          </motion.div>
        </span>
        <StartButton className="block lg:hidden" title="Начать прямо сейчас" />
      </motion.div>
    </div>
  );
};

const AnimatedDiv = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <motion.div
      animate="animate"
      className={className}
      exit="exit"
      initial="initial"
      variants={defaultVariants}
    >
      {children}
    </motion.div>
  );
};
