"use client";

import { Image } from "@heroui/image";
import { Button, Link } from "@heroui/react";
import { motion } from "framer-motion";

import { defaultVariants } from "@/lib/animations/default";

const Landing = () => {
  return (
    <div className="flex flex-col justify-center">
      <HeaderBlock />
      <div className="flex lg:flex-col flex-col max-w-[1200px] mx-auto w-full gap-4 mt-4">
        <HowItWorksBlock />
        <AdvantageBlock />
        <StartButton title="Поехали 🚀" />
      </div>
    </div>
  );
};

export default Landing;

const HeaderBlock = () => {
  return (
    <div className="bg-primary-50 h-3/4 lg:py-32 p-4 shadow-md">
      <motion.div
        animate="animate"
        className="flex lg:flex-row flex-col max-w-[1200px] mx-auto gap-4"
        initial="initial"
        variants={defaultVariants}
      >
        <div className="flex-col flex text-center my-[10%] gap-2">
          <h1 className="font-semibold text-6xl font-mono">MyWishlists</h1>
          <h2 className="text-3xl">
            Бесплатный сервис для составления вишлистов
          </h2>
          <StartButton title="Начать прямо сейчас" />
        </div>
        <div className="relative lg:w-2/3">
          <BeautifulImage src="https://cdn.mywishlists.ru/static/landing/mainPage.png" />
          <BeautifulImage
            className="absolute h-4/5 top-10 right-5 lg:top-20 lg:-right-20"
            src="https://cdn.mywishlists.ru/static/landing/mainPageMobile.png"
          />
        </div>
      </motion.div>
    </div>
  );
};

const HowItWorksBlock = () => {
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
      <DescriptionBlock
        description="Вы можете указать описание и дату события, а так же выбрать, кому будет виден ваш вишлист."
        imageUrl="https://cdn.mywishlists.ru/static/landing/addWishlist.png"
        title="Создавайте вишлисты"
      />
      <DescriptionBlock
        description="Указывайте желанность подарку, цену, картинки, чтобы друзья точно знали, чего вы хотите :)"
        imageUrl="https://cdn.mywishlists.ru/static/landing/addWish.png"
        title="Добавляйте желания"
      />
      <DescriptionBlock
        description="После составления вишлиста вы можете поделиться им с друзьями."
        imageUrl="https://cdn.mywishlists.ru/static/landing/shareWishlist.png"
        title="Делитесь желаниями"
      />
    </div>
  );
};

const DescriptionBlock = ({
  title,
  description,
  imageUrl = undefined,
  className = "",
}: {
  title: string;
  description: string;
  imageUrl?: string | undefined;
  className?: string;
}) => {
  return (
    <motion.div
      className={
        "p-4 shadow-md rounded-xl w-full bg-content1 border-1 dark:border-none " +
        className
      }
      initial="hidden"
      variants={itemVariants}
      viewport={{ once: true }}
      whileHover={{ transform: "translateY(-10px)" }}
      whileInView="show"
    >
      {imageUrl ? (
        <Image removeWrapper className="shadow-md border" src={imageUrl} />
      ) : null}

      <div className="flex">
        <div className="flex flex-col my-auto p-2 lg:p-6 gap-2 w-full">
          <p className="text-2xl text-center font-bold" title={title}>
            {title}
          </p>
          <p className="text-xl text-center" title={description}>
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const AdvantageBlock = () => {
  return (
    <div className="mx-auto p-4">
      <motion.h2
        className="text-3xl font-mono font-semibold text-center mb-10"
        initial="initial"
        variants={defaultVariants}
        viewport={{ once: true }}
        whileInView="animate"
      >
        Ключевые особенности
      </motion.h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DescriptionBlock
          className="bg-primary-50"
          description="Все возможности доступны без ограничений."
          title="Бесплатно"
        />
        <DescriptionBlock
          className="bg-warning-50"
          description="Добавляйте желания из популярных онлайн-магазинов одним кликом."
          title="Автозаполнение"
        />
        <DescriptionBlock
          className="bg-secondary-50 md:col-span-full lg:col-span-1"
          description="Никаких навязанных товаров, только ваши желания."
          title="Без рекламы"
        />
        <DescriptionBlock
          className="col-span-full bg-danger-50"
          description="Сервис адаптирован для мобильных телефонов и компьютеров, исполняйте ваши мечты там, где удобно."
          title="Удобно везде"
        />
        <DescriptionBlock
          className="bg-secondary-50 col-span-1"
          description="Добавляйте ваших друзей и следите за их обновлениями в удобной Ленте."
          title="Друзья"
        />
        <DescriptionBlock
          className="bg-warning-50 md:col-span-2"
          description="Используем современные инструменты, чтобы всё выглядило стильно и красиво."
          title="Дизайн"
        />
      </div>
    </div>
  );
};

const StartButton = ({ title }: { title: string }) => {
  return (
    <motion.div
      className="mx-auto  "
      initial="initial"
      variants={defaultVariants}
      viewport={{ once: true }}
      whileInView="animate"
    >
      <Button
        as={Link}
        className="mt-4 py-8 text-2xl text-center"
        color="primary"
        href="/auth/login"
      >
        {title}
      </Button>
    </motion.div>
  );
};

const BeautifulImage = ({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) => {
  return (
    <Image
      removeWrapper
      className={
        "rounded-2xl lg:skew-y-3 lg:border-r-10 lg:border-t-large transform-gpu shadow-sm border hover:-translate-y-2 duration-200 object-cover " +
        className
      }
      src={src}
    />
  );
};

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
