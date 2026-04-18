import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { Tabs } from "@heroui/react";
import { BsStars } from "react-icons/bs";
import { MdOutlineDesktopMac, MdOutlineSmartphone } from "react-icons/md";

import { StartButton } from "./LandingButton";
import { Video } from "./LandingVideo";

import { defaultVariants } from "@/lib/animations/default";

export const HeaderBlock = () => {
  const [activeTab, setActiveTab] = useState("desktop");

  useEffect(() => {
    setActiveTab(window.innerWidth <= 768 ? "mobile" : "desktop");
  }, []);

  return (
    <div className="bg-accent/50 dark:bg-accent/30 h-3/4 lg:py-32 p-4 shadow-xl relative overflow-hidden rounded-3xl -mx-3 md:mx-0 isolate">
      <div className="absolute h-32 w-32 md:h-96 md:w-96 bg-accent/60 -top-16 -left-16 md:-top-40 md:-left-40 blur-3xl transform-[translateZ(0)]" />
      <div className="absolute h-32 w-32 md:h-96 md:w-96 bg-accent/60 -bottom-16 -right-16 md:-bottom-40 md:-right-40 blur-3xl transform-[translateZ(0)]" />
      <motion.div className="flex lg:flex-row flex-col max-w-300 mx-auto gap-4">
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
            <h1 className="font-semibold text-5xl md:text-6xl">MyWishlists</h1>
          </span>

          <h2 className="text-xl md:text-3xl">
            Бесплатный сервис для составления вишлистов
          </h2>
          <StartButton
            className="hidden lg:block"
            title="Начать прямо сейчас"
          />
        </motion.div>
        <span className="md:skew-y-3 h-125 lg:w-2/3 lg:h-auto">
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
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key.toString())}
            >
              <Tabs.ListContainer>
                <Tabs.List>
                  <Tabs.Tab id="desktop">
                    <MdOutlineDesktopMac className="text-2xl" />
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="mobile">
                    <MdOutlineSmartphone className="text-2xl" />
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <AnimatePresence>
                <Tabs.Panel
                  key="desktop"
                  className="flex justify-center"
                  id="desktop"
                >
                  <AnimatedDiv
                    key="desktop"
                    className="max-h-110 absolute top-14 "
                  >
                    <Video
                      className="my-auto max-h-110"
                      posterSrc="https://cdn.mywishlists.ru/static/landing/light/desktopPreload.jpg"
                      src="https://cdn.mywishlists.ru/static/landing/light/videoMainPC.mp4"
                    />
                  </AnimatedDiv>
                </Tabs.Panel>
                <Tabs.Panel
                  key="mobile"
                  className="flex justify-center"
                  id="mobile"
                >
                  <AnimatedDiv key="mobile" className="absolute top-14">
                    <Video
                      className="h-110 mx-auto"
                      posterSrc="https://cdn.mywishlists.ru/static/landing/light/mobilePreload.jpg"
                      src="https://cdn.mywishlists.ru/static/landing/light/videoMainMobile.mp4"
                    />
                  </AnimatedDiv>
                </Tabs.Panel>
              </AnimatePresence>
            </Tabs>
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
