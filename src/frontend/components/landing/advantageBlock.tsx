import { motion } from "framer-motion";

import { DescriptionBlock } from "./desciptionBlock";

import { defaultVariants } from "@/lib/animations/default";

const items = [
  {
    title: "Бесплатно",
    description: "Все возможности доступны без ограничений.",
    className:
      "bg-gradient-to-br from-blue-300 to-blue-100 dark:from-blue-500 dark:to-blue-950 md:col-span-2",
  },
  {
    title: "Быстрое добавление",
    description: "Добавляйте желания из популярных магазинов за 1 клик.",
    className:
      "bg-gradient-to-bl from-yellow-300 to-yellow-100 dark:from-yellow-500 dark:to-yellow-950",
  },
  {
    title: "Без рекламы",
    description: "Никаких навязанных товаров, только ваши желания.",
    className:
      "bg-gradient-to-r from-purple-300 to-purple-100 dark:from-purple-500 dark:to-purple-950 md:col-span-1",
  },
  {
    title: "Всегда под рукой",
    description: "С телефона и компьютера — где и когда удобно.",
    className:
      "bg-gradient-to-l md:col-span-2 from-purple-300 to-purple-100 dark:from-purple-500 dark:to-purple-950",
  },
  {
    title: "Стильный интерфейс",
    description: "Современно и понятно — приятно пользоваться каждый день.",
    className:
      "bg-gradient-to-tr from-yellow-300 to-yellow-100 dark:from-yellow-500  dark:to-yellow-950 lg:col-span-2",
  },
  {
    title: "Друзья и лента",
    description: "Добавляйте друзей и следите за обновлениями в ленте",
    className:
      "lg:col-span-1 bg-gradient-to-tl from-blue-300 to-blue-100 dark:from-blue-500 dark:to-blue-950",
  },
];

export const AdvantageBlock = () => {
  return (
    <div className="mx-auto p-4">
      <motion.h2
        className="text-3xl font-mono font-semibold text-center mb-10"
        initial="initial"
        variants={defaultVariants}
        viewport={{ once: true }}
        whileInView="animate"
      >
        Всё, что нужно — в одном месте
      </motion.h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          return (
            <DescriptionBlock
              key={item.title}
              className={item.className}
              description={item.description}
              title={item.title}
            />
          );
        })}
      </div>
    </div>
  );
};
