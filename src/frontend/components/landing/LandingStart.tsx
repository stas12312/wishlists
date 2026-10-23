import { Surface } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdHeart } from "react-icons/io";
import {
  MdCheckCircleOutline,
  MdDeleteOutline,
  MdExpandMore,
  MdOutlineCopyAll,
  MdOutlineEdit,
  MdOutlinePublic,
  MdOutlineShare,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";

import {
  Chip,
  FieldLabel,
  Input,
  ModalTitle,
  RoundButton,
} from "./LandingDemo";
import { itemVariants } from "./Landing";

import { defaultVariants } from "@/lib/animations/default";

const Screen = ({ children }: { children: ReactNode }) => (
  <div
    aria-hidden
    className="pointer-events-none relative h-84 select-none overflow-hidden rounded-2xl bg-background shadow-md ring-1 ring-gray-500/20"
  >
    {children}
  </div>
);

const Form = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto flex max-w-80 flex-col gap-1.5 p-4">{children}</div>
);

const WishlistMockup = () => (
  <Screen>
    <Form>
      <ModalTitle>Добавление вишлиста</ModalTitle>
      <FieldLabel isRequired>Название</FieldLabel>
      <Input isFocused value="День рождения 🎂" />
      <FieldLabel>Описание</FieldLabel>
      <Input className="h-10" value="" />
      <FieldLabel>Дата события</FieldLabel>
      <Input value="15.11.2026" />
      <FieldLabel>Кому доступен</FieldLabel>
      <span className="flex h-8 items-center gap-2 rounded-xl bg-default px-3 text-[13px]">
        <MdOutlinePublic />
        Всем по ссылке
        <MdExpandMore className="ml-auto text-muted" />
      </span>
    </Form>
  </Screen>
);

const WishMockup = () => (
  <Screen>
    <Form>
      <ModalTitle>Добавление желания</ModalTitle>
      <span className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-full bg-accent text-[13px] text-accent-foreground">
        <MdOutlineCopyAll />
        Заполнить автоматически
      </span>
      <span className="text-center text-[12px] leading-4 text-muted">
        или вручную
      </span>
      <FieldLabel isRequired>Название</FieldLabel>
      <Input value="Беспроводные наушники 🎧" />
      <div className="grid grid-cols-[2fr_1fr] gap-x-2 gap-y-1.5">
        <FieldLabel>Цена</FieldLabel>
        <FieldLabel>Валюта</FieldLabel>
        <Input value="12 990" />
        <Input value="₽ RUB" />
      </div>
      <FieldLabel>Желанность</FieldLabel>
      <span className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl bg-default text-[16px]">
        {[0, 1, 2, 3, 4].map((heart) => (
          <motion.span
            key={heart}
            initial={{ scale: 0.4, opacity: 0 }}
            transition={{ delay: 0.4 + heart * 0.12, type: "spring" }}
            viewport={{ once: true }}
            whileInView={{ scale: 1, opacity: 1 }}
          >
            <IoMdHeart
              className={heart < 4 ? "text-danger" : "text-muted/60"}
            />
          </motion.span>
        ))}
      </span>
    </Form>
  </Screen>
);

const SHARE_MENU = [
  { label: "Редактировать", icon: <MdOutlineEdit /> },
  { label: "Поделиться", icon: <MdOutlineShare />, isActive: true },
];

const ShareMockup = () => (
  <Screen>
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4 pb-10">
      <div className="flex h-28 w-full max-w-64 flex-col justify-between rounded-3xl bg-surface p-3 shadow-md">
        <span className="flex items-center gap-1.5">
          <RoundButton className="size-7 shadow-none">
            <MdOutlinePublic />
          </RoundButton>
          <span className="min-w-0 flex-1 truncate text-[15px] font-bold uppercase">
            День рождения 🎂
          </span>
          <RoundButton className="size-7">
            <BsThreeDotsVertical />
          </RoundButton>
        </span>
        <span className="ml-auto flex flex-col items-end gap-1">
          <Chip className="bg-accent text-accent-foreground">3 желания</Chip>
          <Chip>15.11.2026</Chip>
        </span>
      </div>
      <div className="-mt-20 ml-auto mr-[max(0px,calc(50%-8rem))] flex w-40 flex-col gap-0.5 rounded-2xl bg-surface p-1.5 text-[13px] shadow-xl ring-1 ring-black/5 dark:ring-white/10">
        {SHARE_MENU.map((item) => (
          <span
            key={item.label}
            className={twMerge(
              "flex items-center gap-2 rounded-xl px-2 py-1",
              item.isActive && "bg-default",
            )}
          >
            {item.icon}
            {item.label}
          </span>
        ))}
        <span className="my-0.5 h-px bg-default" />
        <span className="flex items-center gap-2 rounded-xl px-2 py-1 text-danger">
          <MdDeleteOutline />
          Архивировать
        </span>
      </div>
      <motion.span
        className="flex items-center gap-2 whitespace-nowrap rounded-2xl bg-surface px-3 py-2 text-[13px] shadow-xl ring-1 ring-black/5 dark:ring-white/10"
        initial={{ opacity: 0, y: 16 }}
        transition={{ delay: 0.8 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <MdCheckCircleOutline className="text-lg text-success" />
        Ссылка на вишлист скопирована
      </motion.span>
    </div>
  </Screen>
);

const items = [
  {
    title: "Создайте вишлист",
    description: "Оформите список под событие и настройте, кто его видит",
    mockup: <WishlistMockup />,
    gradient: "from-sky-400 to-blue-600",
  },
  {
    title: "Добавьте желания",
    description:
      "Укажите цену, ссылку, фото и приоритет, чтобы вас понимали с первого раза",
    mockup: <WishMockup />,
    gradient: "from-pink-400 to-rose-600",
  },
  {
    title: "Поделитесь с друзьями",
    description:
      "Отправьте ссылку на вишлист, и друзья выберут подарок без лишних вопросов",
    mockup: <ShareMockup />,
    gradient: "from-violet-400 to-purple-600",
  },
];

const StepCard = ({
  step,
  title,
  description,
  mockup,
  gradient,
}: {
  step: number;
  title: string;
  description: string;
  mockup: ReactNode;
  gradient: string;
}) => {
  return (
    <motion.div
      initial="hidden"
      variants={itemVariants}
      viewport={{ once: true }}
      whileHover={{ transform: "translateY(-10px)" }}
      whileInView="show"
    >
      <Surface className="group relative h-full overflow-hidden rounded-3xl p-4 flex flex-col shadow-md ring-1 ring-gray-500/30">
        <div
          aria-hidden
          className={twMerge(
            "pointer-events-none absolute -bottom-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-linear-to-br opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40",
            gradient,
          )}
        />
        {mockup}
        <div
          className={twMerge(
            "relative z-10 mx-auto -mt-7 flex size-14 items-center justify-center rounded-full bg-linear-to-br text-2xl font-bold text-white shadow-lg ring-4 ring-surface transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
            gradient,
          )}
        >
          {step}
        </div>
        <div className="relative flex flex-col gap-1 p-2 lg:px-6 lg:pb-6">
          <p className="text-2xl text-center font-bold">{title}</p>
          <p className="text-xl text-center">{description}</p>
        </div>
      </Surface>
    </motion.div>
  );
};

export const StartBlock = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4  p-4">
      <motion.h2
        className="text-3xl font-semibold text-center my-4 col-span-full"
        initial="initial"
        variants={defaultVariants}
        viewport={{ once: true }}
        whileInView="animate"
      >
        Простой путь к желанным подаркам
      </motion.h2>
      {items.map((item, index) => {
        return (
          <StepCard
            key={item.title}
            description={item.description}
            gradient={item.gradient}
            mockup={item.mockup}
            step={index + 1}
            title={item.title}
          />
        );
      })}
    </div>
  );
};
