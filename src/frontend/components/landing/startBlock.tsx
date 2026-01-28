import { motion } from "framer-motion";

import { DescriptionBlock } from "./desciptionBlock";

import { defaultVariants } from "@/lib/animations/default";

const items = [
  {
    title: "Создайте вишлист",
    description: "Оформите список под событие и настройте, кто его видит",
    imageUrl: "https://cdn.mywishlists.ru/static/landing/light/addWishlist.png",
  },
  {
    title: "Добавьте желания",
    description:
      "Укажите цену, ссылку, фото и приоритет — чтобы вас понимали с первого раза",
    imageUrl: "https://cdn.mywishlists.ru/static/landing/light/addWish.png",
  },
  {
    title: "Поделитесь с друзьями",
    description:
      "Отправьте ссылку на вишлист — и друзья выберут подарок без вопросов",
    imageUrl:
      "https://cdn.mywishlists.ru/static/landing/light/shareWishlist.png",
  },
];

export const StartBlock = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4  p-4">
      <motion.h2
        className="text-3xl font-mono font-semibold text-center my-4 col-span-full"
        initial="initial"
        variants={defaultVariants}
        viewport={{ once: true }}
        whileInView="animate"
      >
        Простой путь к желанным подаркам
      </motion.h2>
      {items.map((item) => {
        return (
          <DescriptionBlock
            key={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
            title={item.title}
          />
        );
      })}
    </div>
  );
};
