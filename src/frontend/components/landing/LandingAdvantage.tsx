import { Surface } from "@heroui/react";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import {
  MdBlock,
  MdBolt,
  MdBookmarkAdded,
  MdDevices,
  MdLock,
  MdPeople,
  MdQuestionAnswer,
  MdVolunteerActivism,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { itemVariants } from "./Landing";

import { defaultVariants } from "@/lib/animations/default";

const items = [
  {
    title: "Полностью бесплатно",
    description: "Все функции открыты сразу, без подписок и платных тарифов",
    className: "md:col-span-2 lg:row-span-2",
    featured: true,
    icon: MdVolunteerActivism,
    iconColor: "text-success",
  },
  {
    title: "Добавление в 1 клик",
    description:
      "Вставьте ссылку из магазина, а название, цену и фото мы подтянем сами",
    className: "lg:col-span-2",
    icon: MdBolt,
    iconColor: "text-warning",
  },
  {
    title: "Без рекламы",
    description: "Только ваши желания и никаких навязанных товаров",
    className: "",
    icon: MdBlock,
    iconColor: "text-danger",
  },
  {
    title: "Всегда под рукой",
    description: "Спросили про подарок? Вишлист уже в телефоне",
    className: "",
    icon: MdDevices,
    iconColor: "text-accent",
  },
  {
    title: "Анонимные вопросы",
    description: "Друзья уточнят размер или цвет, не раскрывая себя",
    className: "",
    icon: MdQuestionAnswer,
    iconColor: "text-teal-500",
  },
  {
    title: "Лента друзей",
    description: "Следите за вишлистами близких и не гадайте, что им подарить",
    className: "",
    icon: MdPeople,
    iconColor: "text-pink-500",
  },
  {
    title: "Без одинаковых подарков",
    description:
      "Друзья бронируют подарок заранее, поэтому никто не подарит одно и то же дважды",
    className: "md:col-span-2 lg:row-span-2",
    featured: true,
    icon: MdBookmarkAdded,
    iconColor: "text-purple-500",
  },
  {
    title: "Видят только свои",
    description: "Откройте вишлист всем, только друзьям или самым близким",
    className: "lg:col-span-2",
    icon: MdLock,
    iconColor: "text-indigo-500",
  },
];

const AdvantageCard = ({
  title,
  description,
  className,
  Icon,
  iconColor,
  featured = false,
}: {
  title: string;
  description: string;
  className: string;
  Icon: IconType;
  iconColor: string;
  featured?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // На тач-экранах нет hover, поэтому подсвечиваем карточку, проходящую через центр экрана
  const inCenter = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      variants={itemVariants}
      viewport={{ once: true }}
      whileHover={{ transform: "translateY(-10px)" }}
      whileInView="show"
    >
      <Surface
        className={twMerge(
          "group relative h-full overflow-hidden rounded-3xl p-4 lg:p-6 flex flex-col gap-1 shadow-md bg-surface ring-1 ring-gray-500/30",
          featured && "min-h-56 justify-end lg:p-8",
        )}
        data-active={(isTouch && inCenter) || undefined}
      >
        <div
          aria-hidden
          className={twMerge(
            "pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-current opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-35 group-data-active:opacity-35",
            featured && "-right-24 -top-24 size-96",
            iconColor,
          )}
        />
        <Icon
          aria-hidden
          className={twMerge(
            "absolute right-3 top-3 size-10 lg:right-4 lg:top-4 lg:size-12 opacity-30 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-125 group-hover:opacity-100 group-data-active:-rotate-12 group-data-active:scale-125 group-data-active:opacity-100",
            featured &&
              "right-6 top-6 size-20 lg:right-8 lg:top-8 lg:size-28 opacity-60",
            iconColor,
          )}
        />
        <p
          className={twMerge(
            "relative pr-12 lg:pr-14 text-2xl font-bold",
            featured && "pr-0 lg:pr-0 text-3xl lg:text-5xl",
          )}
        >
          {title}
        </p>
        <p className={twMerge("relative text-xl", featured && "lg:text-2xl")}>
          {description}
        </p>
      </Surface>
    </motion.div>
  );
};

export const AdvantageBlock = () => {
  return (
    <div className="mx-auto p-4">
      <motion.h2
        className="text-3xl font-semibold text-center mb-10"
        initial="initial"
        variants={defaultVariants}
        viewport={{ once: true }}
        whileInView="animate"
      >
        Всё нужное в одном месте
      </motion.h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 grid-flow-row-dense gap-4">
        {items.map((item) => {
          return (
            <AdvantageCard
              key={item.title}
              Icon={item.icon}
              className={item.className}
              description={item.description}
              featured={item.featured}
              iconColor={item.iconColor}
              title={item.title}
            />
          );
        })}
      </div>
    </div>
  );
};
