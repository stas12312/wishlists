"use client";

import { AdvantageBlock } from "./advantageBlock";
import { HeaderBlock } from "./header";
import { StartBlock } from "./startBlock";
import { StartButton } from "./startButton";

const Landing = () => {
  return (
    <div className="flex flex-col justify-center">
      <HeaderBlock />
      <div className="flex lg:flex-col flex-col max-w-[1200px] mx-auto w-full gap-4 mt-4">
        <StartBlock />
        <AdvantageBlock />
        <StartButton title="Поехали 🚀" />
      </div>
    </div>
  );
};

export default Landing;

export const itemVariants = {
  hidden: { opacity: 0, transform: "translateY(-20px)" },
  show: {
    opacity: 1,
    transition: { duration: 0.3 },
    transform: "translateY(0px)",
  },
  exit: {
    opacity: 0,
    transform: "translateY(-20px)",
    transition: { duration: 0.1 },
  },
};
