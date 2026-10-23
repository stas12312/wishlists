import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { Tabs } from "@heroui/react";
import { BsStars } from "react-icons/bs";
import { MdOutlineDesktopMac, MdOutlineSmartphone } from "react-icons/md";

import { StartButton } from "./LandingButton";
import { LandingDemo } from "./LandingDemo";

import { defaultVariants } from "@/lib/animations/default";

export const HeaderBlock = () => {
  const [activeTab, setActiveTab] = useState("desktop");

  useEffect(() => {
    setActiveTab(window.innerWidth <= 768 ? "mobile" : "desktop");
  }, []);

  return (
    <div className="bg-linear-to-br from-accent/60 via-accent/35 to-accent/15 dark:from-accent/40 dark:via-accent/20 dark:to-accent/5 lg:py-24 p-4 shadow-xl ring-1 ring-accent/20 relative overflow-hidden rounded-3xl -mx-3 md:mx-0 isolate">
      <div className="absolute -z-10 rounded-full size-48 md:size-112 bg-accent/40 -top-24 -left-24 md:-top-56 md:-left-56 blur-3xl transform-[translateZ(0)]" />
      <div className="absolute -z-10 rounded-full size-64 md:size-160 bg-accent/30 top-1/2 left-1/2 lg:left-2/3 -translate-x-1/2 -translate-y-1/2 blur-3xl transform-[translateZ(0)]" />
      <motion.div className="flex lg:flex-row flex-col lg:items-center max-w-300 mx-auto gap-4 lg:gap-12">
        <motion.div
          animate={{
            opacity: 1,
            transform: "translateX(0)",
            transition: { duration: 0.8 },
          }}
          className="flex-col flex items-center text-center lg:w-2/5 my-[10%] lg:my-0 gap-6 z-10"
          initial={{
            opacity: 0,
            transform: "translateX(-20px)",
          }}
        >
          <span className="flex items-center gap-3">
            <BsStars
              className="shrink-0 text-4xl md:text-5xl"
              style={{ color: "gold" }}
            />
            <h1 className="font-bold tracking-tight text-5xl md:text-6xl">
              MyWishlists
            </h1>
          </span>

          <h2 className="text-xl md:text-3xl leading-snug text-foreground/75 text-balance">
            Бесплатный сервис для составления вишлистов
          </h2>
          <StartButton
            className="hidden lg:block"
            title="Начать прямо сейчас"
          />
        </motion.div>
        <span className="md:skew-y-3 h-125 lg:w-2/3 lg:h-130">
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
                    className="absolute inset-x-0 top-16 h-110"
                  >
                    <LandingDemo variant="desktop" />
                  </AnimatedDiv>
                </Tabs.Panel>
                <Tabs.Panel
                  key="mobile"
                  className="flex justify-center"
                  id="mobile"
                >
                  <AnimatedDiv
                    key="mobile"
                    className="absolute inset-x-0 top-16 h-110"
                  >
                    <LandingDemo variant="mobile" />
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
