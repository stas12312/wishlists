import { Button } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { BsStars, BsThreeDotsVertical } from "react-icons/bs";
import { IoMdAdd, IoMdHeart } from "react-icons/io";
import {
  MdArrowDownward,
  MdAutoAwesome,
  MdBolt,
  MdCheckCircleOutline,
  MdClose,
  MdDeleteOutline,
  MdEventNote,
  MdFilterAlt,
  MdLock,
  MdOutlineCopyAll,
  MdOutlinePublic,
  MdOutlineShare,
  MdPerson,
  MdSort,
  MdStar,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { WishlistChips } from "../wishlist/WishlistChips";
import { ButtonWithLoader } from "../ButtonWithLoader";
import CardImage from "../wish/WishCardImage";
import { ReserveButton } from "../wish/WishCard";
import { WishlistItem } from "../wishlist/WishlistCard";
import {
  DEFAULT_WISHLIST_COLOR,
  WISHLIST_COLORS,
  WISHLIST_EMOJIS,
  DEFAULT_WISHLIST_EMOJI,
  getWishlistGradient,
  getWishlistAccent,
} from "../wishlist/wishlistAppearance";

import { IWishlist, Visible } from "@/lib/models/wishlist";
import { IWish } from "@/lib/models/wish";

type Variant = "desktop" | "mobile";

type Target =
  | "addWishlist"
  | "wishlistName"
  | "wishlistEmoji"
  | "wishlistColor"
  | "wishlistSave"
  | "newWishlist"
  | "addWish"
  | "autofill"
  | "linkInput"
  | "wishSave"
  | "share"
  | "reserve"
  | "idle";

type Scene = "wishlists" | "wishlist" | "friend";
type Field = "typing" | "done";

type Phase = {
  scene: Scene;
  step: number;
  target: Target;
  duration: number;
  click?: boolean;
  wishlistModal?: { name?: Field; themed?: boolean; emoji?: string };
  wishlistCreated?: boolean;
  wishModal?: {
    index: number;
    name?: Field;
    price?: Field;
    fast?: boolean;
    isAutofilled?: boolean;
  };
  linkModal?: { isPasted?: boolean };
  wishes?: number;
  toast?: string;
  reserved?: boolean;
};

const WISHLIST_NAME = "День рождения";
const chosenEmoji = "🍰";
const birthday: IWishlist = {
  uuid: "demo-birthday",
  name: WISHLIST_NAME,
  description: "Идеи к моему празднику",
  date: "2026-11-15",
  created_at: "2026-10-01",
  user_id: 1,
  is_active: true,
  wishes_count: 0,
  visible: Visible.Public,
  visible_user_ids: [],
  settings: { color: "violet", emoji: chosenEmoji },
};
const newYear: IWishlist = {
  ...birthday,
  uuid: "demo-new-year",
  name: "Новый год",
  description: "Подарки под ёлку",
  date: "2026-12-31",
  wishes_count: 3,
  settings: { color: "teal", emoji: "🎄" },
};
const gradient = getWishlistGradient(birthday.uuid, birthday.settings?.color);
const accent = getWishlistAccent(birthday.uuid, birthday.settings?.color);
// Ссылка намеренно ненастоящая: демо не должно рекламировать реальный товар
const PRODUCT_LINK = "https://market.example/product/wireless-headphones";
const SHOPS = [
  "OZON",
  "Wildberries",
  "DNS",
  "Яндекс Маркет",
  "Золотое яблоко",
  "Читай-город",
];

const WISHES = [
  {
    name: "Беспроводные наушники",
    cost: 12990,
    emoji: "🎧",
    friendStatus: "fulfilled",
    gradient: "from-fuchsia-500 to-violet-600",
  },
  {
    name: "Кофемашина",
    cost: 24500,
    emoji: "☕",
    friendStatus: "reserved",
    gradient: "from-amber-400 to-orange-600",
  },
  {
    name: "Набор Lego",
    cost: 8990,
    emoji: "🧱",
    gradient: "from-rose-500 to-orange-500",
  },
];
// Новые желания идут первыми, поэтому на узком экране друг бронирует верхнюю карточку
const RESERVED_WISH = WISHES.length - 1;

const STEPS = [
  { title: "Создайте вишлист", gradient: "from-sky-400 to-blue-600" },
  { title: "Добавьте желания", gradient: "from-pink-400 to-rose-600" },
  { title: "Поделитесь с друзьями", gradient: "from-violet-400 to-purple-600" },
  {
    title: "Друзья бронируют подарки",
    gradient: "from-emerald-400 to-teal-600",
  },
];

const TYPING_SPEED = 70;
const FAST_TYPING_SPEED = 50;

const getPhases = () => {
  const owner = (phase: Omit<Phase, "scene">): Phase => ({
    scene: "wishlists",
    ...phase,
  });
  const wishlist = (
    phase: Omit<Phase, "scene" | "step"> & { step?: number },
  ): Phase => ({
    scene: "wishlist",
    step: 1,
    ...phase,
  });

  const addNextWishes = WISHES.slice(1).flatMap((wish, offset): Phase[] => {
    const index = offset + 1;
    const typingTime =
      (Array.from(wish.name).length + String(wish.cost).length) *
      FAST_TYPING_SPEED;

    return [
      wishlist({ target: "addWish", duration: 900, wishes: index }),
      wishlist({
        target: "addWish",
        duration: 700,
        click: true,
        wishes: index,
        wishModal: { index },
      }),
      wishlist({
        target: "addWish",
        duration: typingTime + 500,
        wishes: index,
        wishModal: { index, name: "typing", price: "typing", fast: true },
      }),
      wishlist({
        target: "wishSave",
        duration: 900,
        wishes: index,
        wishModal: { index, name: "done", price: "done" },
      }),
      wishlist({
        target: "wishSave",
        duration: 700,
        click: true,
        wishes: index + 1,
      }),
    ];
  });

  const share: Phase[] = [
    { scene: "wishlist", step: 2, target: "share", duration: 1100, wishes: 3 },
    {
      scene: "wishlist",
      step: 2,
      target: "share",
      duration: 2200,
      click: true,
      wishes: 3,
      toast: "Ссылка на вишлист скопирована",
    },
  ];

  const timeline: Phase[] = [
    owner({ step: 0, target: "idle", duration: 800 }),
    owner({ step: 0, target: "addWishlist", duration: 900 }),
    owner({
      step: 0,
      target: "addWishlist",
      duration: 500,
      click: true,
      wishlistModal: {},
    }),
    owner({
      step: 0,
      target: "wishlistName",
      duration: 1700,
      wishlistModal: { name: "typing" },
    }),
    owner({
      step: 0,
      target: "wishlistColor",
      duration: 850,
      wishlistModal: { name: "done" },
    }),
    owner({
      step: 0,
      target: "wishlistColor",
      duration: 1000,
      click: true,
      wishlistModal: { name: "done", themed: true },
    }),
    owner({
      step: 0,
      target: "wishlistEmoji",
      duration: 850,
      wishlistModal: { name: "done", themed: true },
    }),
    owner({
      step: 0,
      target: "wishlistEmoji",
      duration: 1800,
      click: true,
      wishlistModal: { name: "done", themed: true, emoji: chosenEmoji },
    }),
    owner({
      step: 0,
      target: "wishlistSave",
      duration: 850,
      wishlistModal: { name: "done", themed: true, emoji: chosenEmoji },
    }),
    owner({
      step: 0,
      target: "wishlistSave",
      duration: 500,
      click: true,
      wishlistCreated: true,
    }),
    owner({
      step: 0,
      target: "newWishlist",
      duration: 1000,
      wishlistCreated: true,
    }),
    owner({
      step: 0,
      target: "newWishlist",
      duration: 400,
      click: true,
      wishlistCreated: true,
    }),
    wishlist({ target: "addWish", duration: 1000 }),
    wishlist({
      target: "addWish",
      duration: 500,
      click: true,
      wishModal: { index: 0 },
    }),
    wishlist({ target: "autofill", duration: 800, wishModal: { index: 0 } }),
    wishlist({ target: "autofill", duration: 500, click: true, linkModal: {} }),
    wishlist({ target: "linkInput", duration: 800, linkModal: {} }),
    wishlist({
      target: "linkInput",
      duration: 150,
      click: true,
      linkModal: { isPasted: true },
    }),
    wishlist({
      target: "wishSave",
      duration: 450,
      wishModal: { index: 0, name: "done", price: "done", isAutofilled: true },
    }),
    wishlist({ target: "wishSave", duration: 500, click: true, wishes: 1 }),
    ...addNextWishes,
    ...share,
    { scene: "friend", step: 3, target: "idle", duration: 900, wishes: 3 },
    { scene: "friend", step: 3, target: "reserve", duration: 1100, wishes: 3 },
    {
      scene: "friend",
      step: 3,
      target: "reserve",
      duration: 2000,
      click: true,
      wishes: 3,
      reserved: true,
      toast: "Желание забронировано",
    },
    {
      scene: "friend",
      step: 3,
      target: "idle",
      duration: 1600,
      wishes: 3,
      reserved: true,
    },
  ];

  return timeline;
};

const CANVAS = {
  desktop: { width: 960, height: 560 },
  mobile: { width: 340, height: 680 },
};

const usePhase = (phases: ReturnType<typeof getPhases>, isPaused: boolean) => {
  const [index, setIndex] = useState(0);
  const phase = phases[index % phases.length];

  useEffect(() => {
    if (isPaused) return;
    const timeout = setTimeout(
      () => setIndex((current) => (current + 1) % phases.length),
      phase.duration,
    );

    return () => clearTimeout(timeout);
  }, [index, isPaused, phase, phases.length]);

  return { index, phase };
};

// Демо крутится только на виду: за экраном или в фоновой вкладке оно лишь грузило бы процессор
const useIsOnScreen = (ref: RefObject<HTMLElement | null>) => {
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsIntersecting(entry.isIntersecting),
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    const update = () => setIsPageVisible(!document.hidden);

    update();
    document.addEventListener("visibilitychange", update);

    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return isIntersecting && isPageVisible;
};

// Миллисекунды с начала фазы; таймер тикает, только пока что-то печатается
const usePhaseElapsed = (index: number, isTicking: boolean) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    if (!isTicking) return;
    const start = Date.now();
    const interval = setInterval(() => setElapsed(Date.now() - start), 30);

    return () => clearInterval(interval);
  }, [index, isTicking]);

  return elapsed;
};

const typeText = (
  text: string,
  field: Field | undefined,
  elapsed: number,
  speed: number,
) => {
  if (!field) return "";
  const chars = Array.from(text);

  if (field === "done") return text;

  return chars.slice(0, Math.max(0, Math.floor(elapsed / speed))).join("");
};

// Вписывает холст фиксированного размера в контейнер, чтобы демо выглядело одинаково на любой ширине
const useFitScale = (
  containerRef: RefObject<HTMLDivElement | null>,
  variant: Variant,
) => {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setScale(
        Math.min(
          width / CANVAS[variant].width,
          height / CANVAS[variant].height,
        ),
      );
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef, variant]);

  return scale;
};

// offsetLeft/offsetTop не учитывают CSS-трансформации, поэтому курсор точен и внутри наклонённой шапки
const getCenterInCanvas = (element: HTMLElement, canvas: HTMLElement) => {
  let x = element.offsetWidth / 2;
  let y = element.offsetHeight / 2;
  let current: HTMLElement | null = element;

  while (current && current !== canvas) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return { x, y };
};

type SetTarget = (name: Target) => (element: HTMLElement | null) => void;

export const LandingDemo = ({
  variant,
  className = "",
}: {
  variant: Variant;
  className?: string;
}) => {
  const isMobile = variant === "mobile";
  const [phases] = useState(getPhases);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Partial<Record<Target, HTMLElement | null>>>({});
  const reduceMotion = useReducedMotion();
  const scale = useFitScale(containerRef, variant);
  const isOnScreen = useIsOnScreen(containerRef);
  const isPaused = !!reduceMotion || !isOnScreen;
  const { index, phase } = usePhase(phases, isPaused);
  const isTyping =
    phase.wishlistModal?.name === "typing" ||
    phase.wishModal?.name === "typing" ||
    phase.wishModal?.price === "typing";
  const elapsed = usePhaseElapsed(index, isTyping && !isPaused);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  // null от элемента, доигравшего анимацию исчезновения, не должен затирать только что появившуюся замену
  const setTarget: SetTarget = (name) => (element) => {
    if (element) targetRefs.current[name] = element;
  };

  useEffect(() => {
    if (phase.target === "idle") {
      setCursor({
        x: CANVAS[variant].width * 0.7,
        y: CANVAS[variant].height * 0.75,
      });

      return;
    }

    // Цель может появиться только после анимации предыдущей сцены или модалки,
    // поэтому курсор ждёт на месте, а не уезжает в запасную точку
    const moveCursor = () => {
      const canvas = canvasRef.current;
      const element = targetRefs.current[phase.target];

      if (!canvas || !element?.isConnected) return;
      const next = getCenterInCanvas(element, canvas);

      setCursor((current) =>
        current.x === next.x && current.y === next.y ? current : next,
      );
    };

    moveCursor();
    const interval = setInterval(moveCursor, 50);
    const timeout = setTimeout(() => clearInterval(interval), 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase, variant]);

  const { width, height } = CANVAS[variant];
  const step = STEPS[phase.step];
  const isFriend = phase.scene === "friend";
  const wishModal = phase.wishModal;
  const formColor = phase.wishlistModal?.themed
    ? birthday.settings!.color
    : DEFAULT_WISHLIST_COLOR;
  const speed = wishModal?.fast ? FAST_TYPING_SPEED : TYPING_SPEED;
  const modalWish = wishModal ? WISHES[wishModal.index] : undefined;
  // Когда название и цена заполняются в одной фазе, цена начинает печататься после названия
  const nameTypingTime = modalWish
    ? Array.from(modalWish.name).length * speed
    : 0;
  const focusedField =
    wishModal?.name === "typing" && elapsed < nameTypingTime
      ? "name"
      : wishModal?.price === "typing"
        ? "price"
        : undefined;

  return (
    <div
      ref={containerRef}
      aria-label="Демонстрация работы сервиса"
      className={twMerge("relative w-full h-full", className)}
      role="img"
    >
      <div
        className="absolute left-1/2 top-0 origin-top"
        style={{
          width,
          height,
          transform: `translateX(-50%) scale(${scale})`,
          opacity: scale ? 1 : 0,
        }}
      >
        <div
          ref={canvasRef}
          className={twMerge(
            "relative flex size-full flex-col overflow-hidden bg-background text-foreground shadow-2xl ring-1 ring-black/10 dark:ring-white/10 select-none",
            isMobile ? "rounded-[44px] border-8 border-black" : "rounded-2xl",
            isPaused && "[&_*]:[animation-play-state:paused]",
          )}
        >
          {isMobile ? (
            <div className="h-7 shrink-0">
              <div className="absolute left-1/2 top-2 z-50 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
            </div>
          ) : (
            <BrowserBar
              url={
                phase.scene === "wishlists"
                  ? "mywishlists.ru"
                  : "mywishlists.ru/wishlists/3f9a…"
              }
            />
          )}

          <TopBar isFriend={isFriend} isMobile={isMobile} />

          <div
            className={twMerge(
              "relative flex min-h-0 flex-1",
              isMobile ? "px-3" : "px-8 pt-2",
            )}
          >
            <div className="relative min-w-0 flex-1">
              <AnimatePresence initial={false} mode="wait">
                {phase.scene === "wishlists" ? (
                  <SceneFade key="wishlists">
                    <WishlistsScene
                      isMobile={isMobile}
                      phase={phase}
                      setTarget={setTarget}
                    />
                  </SceneFade>
                ) : (
                  <SceneFade key={phase.scene}>
                    <WishlistScene
                      isFriend={isFriend}
                      isMobile={isMobile}
                      phase={phase}
                      setTarget={setTarget}
                    />
                  </SceneFade>
                )}
              </AnimatePresence>
            </div>
          </div>

          {isMobile ? <BottomMenu /> : null}

          <AnimatePresence>
            {phase.wishlistModal ? (
              <Modal
                key="wishlist-modal"
                isMobile={isMobile}
                theme={getWishlistAccent(birthday.uuid, formColor)}
              >
                <WishlistForm
                  color={formColor}
                  emoji={phase.wishlistModal.emoji ?? DEFAULT_WISHLIST_EMOJI}
                  name={typeText(
                    WISHLIST_NAME,
                    phase.wishlistModal.name,
                    elapsed,
                    TYPING_SPEED,
                  )}
                  setTarget={setTarget}
                />
              </Modal>
            ) : null}
            {wishModal && modalWish ? (
              <Modal key="wish-modal" isMobile={isMobile} theme={accent}>
                <WishForm
                  focusedField={focusedField}
                  isAutofilled={!!wishModal.isAutofilled}
                  name={typeText(
                    modalWish.name,
                    wishModal.name,
                    elapsed,
                    speed,
                  )}
                  price={typeText(
                    String(modalWish.cost),
                    wishModal.price,
                    wishModal.name === "typing"
                      ? elapsed - nameTypingTime
                      : elapsed,
                    speed,
                  )}
                  setTarget={setTarget}
                  wish={modalWish}
                />
              </Modal>
            ) : null}
            {phase.linkModal ? (
              <Modal key="link-modal" isMobile={isMobile} theme={accent}>
                <LinkForm
                  isPasted={!!phase.linkModal.isPasted}
                  setTarget={setTarget}
                />
              </Modal>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {phase.toast ? (
              <motion.div
                key={phase.toast}
                animate={{ opacity: 1, y: 0 }}
                className={twMerge(
                  "absolute left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl bg-surface px-4 py-3 text-[14px] shadow-xl ring-1 ring-black/5 dark:ring-white/10",
                  isMobile ? "bottom-24" : "bottom-6",
                )}
                exit={{ opacity: 0, y: 20 }}
                initial={{ opacity: 0, y: 20 }}
              >
                <MdCheckCircleOutline className="text-success text-lg" />
                {phase.toast}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <Cursor
            isClick={!!phase.click}
            isHidden={isTyping}
            isTouch={isMobile}
            phaseIndex={index}
            x={cursor.x}
            y={cursor.y}
          />
        </div>

        <div className="absolute -bottom-5 left-1/2 z-50 -translate-x-1/2">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={phase.step}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-surface py-1.5 pl-1.5 pr-4 text-[16px] font-semibold shadow-xl ring-1 ring-black/10 dark:ring-white/10"
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <span
                className={twMerge(
                  "flex size-7 items-center justify-center rounded-full bg-linear-to-br text-[14px] font-bold text-white",
                  step.gradient,
                )}
              >
                {phase.step + 1}
              </span>
              {step.title}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SceneFade = ({ children }: { children: ReactNode }) => (
  <motion.div
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -24 }}
    initial={{ opacity: 0, x: 24 }}
    transition={{ duration: 0.35 }}
  >
    {children}
  </motion.div>
);

const BrowserBar = ({ url }: { url: string }) => (
  <div className="flex h-9 shrink-0 items-center gap-3 border-b border-black/5 bg-default/60 px-4 dark:border-white/10">
    <div className="flex gap-1.5">
      <span className="size-3 rounded-full bg-red-400" />
      <span className="size-3 rounded-full bg-amber-400" />
      <span className="size-3 rounded-full bg-green-400" />
    </div>
    <div className="mx-auto flex h-6 w-96 items-center justify-center gap-1.5 rounded-lg bg-background/80 text-[12px] text-muted">
      <MdLock />
      {url}
    </div>
    <div className="w-12" />
  </div>
);

const Avatar = ({
  letter,
  className,
}: {
  letter: string;
  className?: string;
}) => (
  <span
    className={twMerge(
      "flex size-9 shrink-0 items-center justify-center rounded-full bg-default text-[14px]",
      className,
    )}
  >
    {letter}
  </span>
);

const TopBar = ({
  isFriend,
  isMobile,
}: {
  isFriend: boolean;
  isMobile: boolean;
}) => (
  <div
    className={twMerge(
      "flex h-14 shrink-0 items-center justify-between",
      isMobile ? "px-4" : "px-5",
    )}
  >
    {isMobile ? null : (
      <span className="flex w-48 items-center gap-1.5 text-[20px] font-bold">
        <BsStars style={{ color: "gold" }} />
        MyWishlists
      </span>
    )}
    <span className="flex items-center gap-0.5 text-[16px]">
      <MdBolt />
      Блог
    </span>
    <AnimatePresence initial={false} mode="wait">
      <motion.span
        key={isFriend ? "friend" : "owner"}
        animate={{ opacity: 1 }}
        className={twMerge(
          "flex items-center gap-2",
          isMobile ? "" : "w-48 justify-end",
        )}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      >
        <Avatar letter={isFriend ? "Д" : "С"} />
        <span className="flex flex-col leading-tight">
          <span className="text-[14px]">{isFriend ? "Дима" : "Саша"}</span>
          <span className="text-[11px] text-muted">
            {isFriend ? "@dima" : "@sasha"}
          </span>
        </span>
      </motion.span>
    </AnimatePresence>
  </div>
);

const MENU = [
  { title: "Вишлисты", icon: <MdAutoAwesome className="text-amber-400" /> },
  { title: "Желания", icon: <MdStar /> },
  { title: "Друзья", icon: <MdPerson /> },
  { title: "Лента", icon: <MdEventNote /> },
];

const BottomMenu = () => (
  <div className="absolute inset-x-2 bottom-3 z-20 grid grid-cols-4 rounded-3xl bg-surface/90 py-2 shadow-lg ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
    {MENU.map((item, index) => (
      <span
        key={item.title}
        className={twMerge(
          "mx-1 flex flex-col items-center gap-0.5 rounded-2xl py-1 text-[11px]",
          index === 0 && "bg-amber-100/70 dark:bg-amber-400/15",
        )}
      >
        <span className="text-[22px]">{item.icon}</span>
        {item.title}
      </span>
    ))}
  </div>
);

export const RoundButton = ({
  ref,
  isPressed,
  className,
  children,
}: {
  ref?: (element: HTMLElement | null) => void;
  isPressed?: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <motion.span
    ref={ref}
    animate={{ scale: isPressed ? 0.85 : 1 }}
    className={twMerge(
      "flex size-8 shrink-0 items-center justify-center rounded-full bg-default/70 text-[14px] shadow-md",
      className,
    )}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.span>
);

const Pressable = ({
  ref,
  className,
  isPressed,
  children,
}: {
  ref?: (element: HTMLElement | null) => void;
  className?: string;
  isPressed?: boolean;
  children: ReactNode;
}) => (
  <motion.div
    ref={ref}
    animate={{ scale: isPressed ? 0.95 : 1 }}
    className={className}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.div>
);

const CreateButton = ({
  ref,
  title,
  isPressed,
  className,
}: {
  ref?: (element: HTMLElement | null) => void;
  title: string;
  isPressed?: boolean;
  className?: string;
}) => (
  <Pressable ref={ref} className={className} isPressed={isPressed}>
    <span inert className="block">
      <Button className="w-full" variant="primary">
        <IoMdAdd />
        {title}
      </Button>
    </span>
  </Pressable>
);

export const Chip = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <span
    className={twMerge(
      "flex items-center gap-1 whitespace-nowrap rounded-full bg-default px-2.5 py-0.5 text-[12px]",
      className,
    )}
  >
    {children}
  </span>
);

const FilterRow = () => (
  <div className="flex items-center gap-2">
    <RoundButton className="wishlist-accent-trigger bg-[var(--button-bg)] text-[color:var(--button-fg)]">
      <MdFilterAlt />
    </RoundButton>
    <Chip className="wishlist-accent-trigger bg-[var(--button-bg)] text-[color:var(--button-fg)] py-1.5 shadow-md">
      <MdSort />
      Дате добавления
      <MdArrowDownward />
    </Chip>
  </div>
);

const WishlistsScene = ({
  phase,
  isMobile,
  setTarget,
}: {
  phase: Phase;
  isMobile: boolean;
  setTarget: SetTarget;
}) => (
  <div className="flex flex-col gap-3">
    <div
      className={twMerge(
        "flex gap-4 border-b border-black/10 pb-4 dark:border-white/10",
        isMobile ? "flex-col" : "items-center justify-between",
      )}
    >
      <p className="text-2xl font-semibold">Вишлисты</p>
      <CreateButton
        ref={setTarget("addWishlist")}
        isPressed={phase.click && phase.target === "addWishlist"}
        title="Добавить вишлист"
      />
    </div>
    <RoundButton>
      <MdFilterAlt />
    </RoundButton>
    <div
      className={twMerge(
        "grid gap-3",
        isMobile ? "grid-cols-1" : "grid-cols-3",
      )}
    >
      <AnimatePresence>
        {phase.wishlistCreated ? (
          <motion.div
            key="created"
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          >
            <Pressable
              ref={setTarget("newWishlist")}
              isPressed={phase.click && phase.target === "newWishlist"}
            >
              <DemoWishlist wishlist={birthday} />
            </Pressable>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <DemoWishlist wishlist={newYear} />
    </div>
  </div>
);

const DemoWishlist = ({ wishlist }: { wishlist: IWishlist }) => (
  <div inert>
    <WishlistItem
      wishlist={wishlist}
      onDelete={async () => {}}
      onRestore={() => {}}
    />
  </div>
);

const Modal = ({
  theme,
  isMobile,
  children,
}: {
  theme: string;
  isMobile: boolean;
  children: ReactNode;
}) => (
  <motion.div
    animate={{ opacity: 1 }}
    // Прижата к верху: модалка по центру сдвигается, когда набираемый текст меняет её высоту
    className={twMerge(
      "absolute inset-0 z-30 flex items-start justify-center bg-black/40",
      isMobile ? "pt-20" : "pt-12",
    )}
    exit={{ opacity: 0 }}
    initial={{ opacity: 0 }}
  >
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className={twMerge(
        "wishlist-overlay flex flex-col gap-1 rounded-3xl bg-overlay p-4 shadow-2xl",
        theme,
        isMobile ? "w-[92%]" : "w-90",
      )}
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
    >
      {children}
    </motion.div>
  </motion.div>
);

export const Input = ({
  ref,
  value,
  placeholder = "",
  isFocused,
  className,
}: {
  ref?: (element: HTMLElement | null) => void;
  value: string;
  placeholder?: string;
  isFocused?: boolean;
  className?: string;
}) => (
  <span
    ref={ref}
    className={twMerge(
      "flex h-8 shrink-0 items-center overflow-hidden whitespace-nowrap rounded-xl bg-default px-3 text-[13px] leading-none",
      isFocused && "ring-2 ring-accent",
      className,
    )}
  >
    <span className={twMerge("truncate", !value && "text-muted")}>
      {value || placeholder}
    </span>
    <span
      className={twMerge(
        "ml-0.5 h-4 w-px shrink-0 bg-foreground",
        isFocused ? "animate-pulse [animation-duration:0.9s]" : "opacity-0",
      )}
    />
  </span>
);

export const FieldLabel = ({
  children,
  isRequired,
}: {
  children: ReactNode;
  isRequired?: boolean;
}) => (
  <span className="text-[12px] font-medium leading-4">
    {children}
    {isRequired ? <span className="text-danger">*</span> : null}
  </span>
);

const SaveButton = ({
  setTarget,
  target,
}: {
  setTarget: SetTarget;
  target: Target;
}) => (
  <span
    ref={setTarget(target)}
    className="mt-1 flex h-8 items-center justify-center rounded-full bg-accent text-[13px] font-medium text-accent-foreground"
  >
    Сохранить
  </span>
);

export const DemoEmojiPicker = ({
  emoji,
  targetRef,
}: {
  emoji: string;
  targetRef?: (element: HTMLElement | null) => void;
}) => (
  <>
    <FieldLabel>Эмодзи</FieldLabel>
    <div className="flex flex-wrap gap-1">
      {WISHLIST_EMOJIS.map((option) => (
        <span
          key={option}
          ref={option === chosenEmoji ? targetRef : undefined}
          className={twMerge(
            "grid size-7 place-items-center rounded-lg bg-default",
            option === emoji && "ring-2 ring-[var(--accent)]",
          )}
        >
          {option}
        </span>
      ))}
    </div>
  </>
);

const WishlistForm = ({
  emoji,
  color,
  name,
  setTarget,
}: {
  name: string;
  color: string;
  emoji: string;
  setTarget: SetTarget;
}) => (
  <>
    <p className="text-center text-[14px]">Добавление вишлиста</p>
    <FieldLabel isRequired>Название</FieldLabel>
    <Input ref={setTarget("wishlistName")} isFocused value={name} />
    <FieldLabel>Описание</FieldLabel>
    <Input value="" />
    <FieldLabel>Оформление</FieldLabel>
    <div
      className={twMerge(
        "flex h-12 items-center gap-2 rounded-xl bg-gradient-to-br px-3 text-sm font-semibold",
        getWishlistGradient(birthday.uuid, color),
      )}
    >
      <span className="text-xl">{emoji}</span>
      {name}
    </div>
    <FieldLabel>Цвет</FieldLabel>
    <div className="flex gap-2 px-1 py-1">
      {WISHLIST_COLORS.map((option) => (
        <span
          key={option.id}
          ref={
            option.id === birthday.settings?.color
              ? setTarget("wishlistColor")
              : undefined
          }
          className={twMerge(
            "size-6 rounded-full",
            option.swatch,
            option.id === color && "ring-2 ring-[var(--accent)] ring-offset-2",
          )}
          title={option.label}
        />
      ))}
    </div>

    <DemoEmojiPicker emoji={emoji} targetRef={setTarget("wishlistEmoji")} />
    <FieldLabel>Дата события</FieldLabel>
    <Input
      className="justify-between"
      placeholder="дд.мм.гггг"
      value={name ? "15.11.2026" : ""}
    />
    <FieldLabel>Кому доступен</FieldLabel>
    <span className="flex h-8 items-center gap-2 rounded-xl bg-default px-3 text-[13px]">
      <MdOutlinePublic />
      Всем по ссылке
    </span>
    <SaveButton setTarget={setTarget} target="wishlistSave" />
  </>
);

export const ModalTitle = ({ children }: { children: ReactNode }) => (
  <span className="relative text-center text-[14px] leading-5">
    {children}
    <MdClose className="absolute right-0 top-0.5 text-muted" />
  </span>
);

const WishForm = ({
  wish,
  name,
  price,
  focusedField,
  isAutofilled,
  setTarget,
}: {
  wish: (typeof WISHES)[number];
  name: string;
  price: string;
  focusedField?: "name" | "price";
  isAutofilled: boolean;
  setTarget: SetTarget;
}) => (
  <>
    <ModalTitle>Добавление желания</ModalTitle>
    <span
      ref={setTarget("autofill")}
      className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-full bg-accent text-[13px] text-accent-foreground"
    >
      <MdOutlineCopyAll />
      Заполнить автоматически
    </span>
    <span className="text-center text-[12px] leading-4 text-muted">
      или вручную
    </span>
    <FieldLabel isRequired>Название</FieldLabel>
    <Input isFocused={focusedField === "name"} value={name} />
    <FieldLabel>Комментарий</FieldLabel>
    <Input value="" />
    <div className="grid grid-cols-[2fr_1fr] gap-2">
      <FieldLabel>Цена</FieldLabel>
      <FieldLabel>Валюта</FieldLabel>
      <Input isFocused={focusedField === "price"} value={price} />
      <Input value="₽ RUB" />
    </div>
    <FieldLabel>Ссылка на товар</FieldLabel>
    <Input value={isAutofilled ? PRODUCT_LINK : ""} />
    <FieldLabel>Желанность</FieldLabel>
    <span className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl bg-default text-[16px]">
      <IoMdHeart className="text-danger" />
      {[1, 2, 3, 4].map((heart) => (
        <IoMdHeart key={heart} className="text-muted/60" />
      ))}
    </span>
    <FieldLabel>Изображения</FieldLabel>
    <span className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-default px-2 text-[11px] text-muted">
      {isAutofilled ? (
        <motion.span
          animate={{ opacity: 1, scale: 1 }}
          className={twMerge(
            "flex size-9 items-center justify-center rounded-lg bg-linear-to-br text-2xl",
            wish.gradient,
          )}
          initial={{ opacity: 0, scale: 0.6 }}
        >
          {wish.emoji}
        </motion.span>
      ) : (
        <span className="w-full text-center">
          Перетащите файл сюда или нажмите для выбора файла
        </span>
      )}
    </span>
    <SaveButton setTarget={setTarget} target="wishSave" />
  </>
);

const LinkForm = ({
  isPasted,
  setTarget,
}: {
  isPasted: boolean;
  setTarget: SetTarget;
}) => (
  <>
    <ModalTitle>Автозаполнение</ModalTitle>
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-accent/10 p-3">
      <span className="text-center text-[12px] font-medium leading-4">
        На данный момент поддерживается заполнение из
      </span>
      <span className="flex flex-wrap justify-center gap-1">
        {SHOPS.map((shop) => (
          <Chip key={shop} className="bg-surface shadow-sm">
            {shop}
          </Chip>
        ))}
      </span>
    </div>
    <FieldLabel isRequired>Ссылка на товар</FieldLabel>
    <Input
      ref={setTarget("linkInput")}
      isFocused={!isPasted}
      value={isPasted ? PRODUCT_LINK : ""}
    />
    <div inert>
      <ButtonWithLoader fullWidth isLoading={isPasted} loaderText="Загрузка">
        Загрузить
      </ButtonWithLoader>
    </div>
  </>
);

const WishlistScene = ({
  phase,
  isFriend,
  isMobile,
  setTarget,
}: {
  phase: Phase;
  isFriend: boolean;
  isMobile: boolean;
  setTarget: SetTarget;
}) => {
  const count = phase.wishes ?? 0;
  const wishes = WISHES.slice(0, count)
    .map((wish, index) => ({ ...wish, index }))
    .reverse();
  const total = WISHES.slice(0, count).reduce(
    (sum, wish) => sum + wish.cost,
    0,
  );
  const isPressed = (target: Target) => phase.click && phase.target === target;

  return (
    <div className={twMerge("relative flex flex-col gap-3", accent)}>
      {isFriend ? (
        <div className="flex items-center justify-center gap-3">
          <Avatar className="size-11" letter="С" />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[16px]">Саша</span>
            <span className="text-[13px] text-accent">@sasha</span>
            <span className="mt-1 rounded-full bg-accent px-3 py-0.5 text-[12px] text-accent-foreground">
              Добавить в друзья
            </span>
          </span>
        </div>
      ) : null}

      <div
        className={twMerge(
          "grid gap-x-2 rounded-3xl bg-gradient-to-br p-4",
          gradient,
          accent,
          isMobile
            ? "grid-cols-1 gap-y-3"
            : "grid-cols-[minmax(0,1fr)_auto] gap-y-2",
        )}
      >
        <span
          className={twMerge(
            "flex min-w-0 items-center gap-1 whitespace-nowrap",
            isMobile
              ? "flex-wrap justify-center text-[16px] leading-6"
              : "text-[20px] leading-7",
          )}
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white/40 text-2xl dark:bg-white/15">
            {birthday.settings?.emoji ?? DEFAULT_WISHLIST_EMOJI}
          </span>
          <span className="truncate font-medium">{WISHLIST_NAME}</span>
        </span>
        <span
          className={twMerge(
            "flex items-center justify-center gap-2",
            !isMobile && "col-start-2 row-start-1 self-center",
          )}
        >
          <RoundButton
            ref={setTarget("share")}
            className="wishlist-accent-button size-9 bg-[var(--button-bg)] text-[color:var(--button-fg)] shadow-none backdrop-blur-sm"
            isPressed={isPressed("share")}
          >
            <MdOutlineShare className="text-[16px]" />
          </RoundButton>
          {isFriend ? null : (
            <>
              <RoundButton className="wishlist-danger-button size-9 bg-[var(--button-bg)] text-[color:var(--button-fg)] shadow-none backdrop-blur-sm">
                <MdDeleteOutline className="text-[16px]" />
              </RoundButton>
            </>
          )}
        </span>
        <WishlistChips
          className={isMobile ? "justify-center" : "col-span-full"}
          isOwner={!isFriend}
          statistic={{ totalCount: count, fullfiledCount: 0, totalSum: total }}
          wishlist={birthday}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {count > 0 && <FilterRow />}
        {!isFriend && (
          <CreateButton
            ref={setTarget("addWish")}
            className={isMobile ? "w-full" : "ml-auto"}
            isPressed={isPressed("addWish")}
            title="Добавить желание"
          />
        )}
      </div>

      <div
        className={twMerge(
          "grid gap-3",
          isMobile ? "grid-cols-1" : "grid-cols-4",
        )}
      >
        <AnimatePresence initial={false}>
          {wishes.map((wish) => (
            <motion.div
              key={wish.name}
              layout
              animate={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", bounce: 0.35, duration: 0.55 }}
            >
              <WishCard
                isFriend={isFriend}
                isMobile={isMobile}
                isPressed={wish.index === RESERVED_WISH && isPressed("reserve")}
                isReserved={
                  isFriend && wish.index === RESERVED_WISH && !!phase.reserved
                }
                reserveRef={
                  wish.index === RESERVED_WISH
                    ? setTarget("reserve")
                    : undefined
                }
                wish={wish}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const WishCard = ({
  wish,
  isFriend,
  isMobile,
  isPressed,
  isReserved,
  reserveRef,
}: {
  wish: (typeof WISHES)[number];
  isFriend: boolean;
  isMobile: boolean;
  isPressed?: boolean;
  isReserved: boolean;
  reserveRef?: (element: HTMLElement | null) => void;
}) => {
  // Владелец не видит, что забронировано или исполнено, поэтому статусы показываются только другу
  const friendStatus = isFriend ? wish.friendStatus : undefined;
  const canReserve = isFriend && !friendStatus;
  const statusWish: IWish = {
    name: wish.name,
    comment: "",
    cost: wish.cost,
    currency: "RUB",
    wishlist: birthday,
    wishlist_uuid: birthday.uuid,
    user: { id: 1, name: "Саша", username: "sasha", email: "", image: "" },
    images: [
      "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><text x="160" y="155" text-anchor="middle" font-size="100">' +
            wish.emoji +
            "</text></svg>",
        ),
    ],
    uuid: wish.name,
    fulfilled_at: friendStatus === "fulfilled" ? "2026-10-01" : undefined,
    is_reserved: isReserved || friendStatus === "reserved",
    actions: {
      edit: !isFriend,
      reserve: canReserve && !isReserved,
      cancel_reserve: isReserved,
      make_full: false,
      cancel_full: false,
      open_wishlist: false,
    },
  };

  return (
    <div
      className={twMerge(
        "relative isolate flex flex-col overflow-hidden rounded-3xl shadow-md ring-1 ring-gray-500/30",
        accent,
        isMobile ? "h-56" : "h-52",
      )}
    >
      <div
        className={twMerge(
          "wishlist-card-backdrop absolute inset-0 -z-10 bg-gradient-to-br opacity-60",
          gradient,
        )}
      />
      <div className="flex h-12 shrink-0 items-center justify-between px-2.5 pt-1">
        <span className="truncate text-[18px] font-bold leading-5">
          {wish.name}
        </span>
        <RoundButton className="wishlist-card-menu-button size-8 bg-[var(--button-bg)] text-[color:var(--button-fg)] shadow-none">
          <BsThreeDotsVertical />
        </RoundButton>
      </div>
      <div className="relative min-h-0 flex-1">
        <CardImage
          chipsClassName={canReserve ? "bottom-12" : undefined}
          hideReservedStatus={!isFriend}
          wish={statusWish}
        />
        {canReserve ? (
          <motion.div
            ref={reserveRef}
            inert
            animate={{ scale: isPressed ? 0.92 : 1 }}
            className="absolute inset-x-2 bottom-2 z-20"
          >
            <ReserveButton
              action={isReserved ? "cancel_reserve" : "reserve"}
              onPress={() => {}}
            />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

const Cursor = ({
  x,
  y,
  isClick,
  isTouch,
  isHidden,
  phaseIndex,
}: {
  x: number;
  y: number;
  isClick: boolean;
  isTouch: boolean;
  isHidden: boolean;
  phaseIndex: number;
}) => (
  <motion.div
    animate={{ x, y, opacity: isHidden ? 0 : 1 }}
    className="pointer-events-none absolute left-0 top-0 z-50"
    initial={false}
    transition={{
      x: { type: "spring", stiffness: 70, damping: 16 },
      y: { type: "spring", stiffness: 70, damping: 16 },
      // Задержка даёт клику, открывающему форму, доиграть до того, как курсор исчезнет
      opacity: { duration: 0.2, delay: isHidden ? 0.4 : 0 },
    }}
  >
    {isClick ? (
      <motion.span
        key={phaseIndex}
        animate={{ scale: 2.2, opacity: 0 }}
        className="absolute -left-4 -top-4 size-8 rounded-full bg-accent/50"
        initial={{ scale: 0.4, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    ) : null}
    {isTouch ? (
      <motion.span
        animate={{ scale: isClick ? 0.8 : 1 }}
        className="absolute -left-5 -top-5 size-10 rounded-full border-2 border-white/80 bg-black/25 shadow-lg"
      />
    ) : (
      <motion.svg
        animate={{ scale: isClick ? 0.85 : 1 }}
        className="absolute -left-1 -top-1 drop-shadow-md"
        height="26"
        viewBox="0 0 24 24"
        width="26"
      >
        <path
          d="M4 2l16 9.5-7 1.6-3.6 6.9L4 2z"
          fill="black"
          stroke="white"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </motion.svg>
    )}
  </motion.div>
);
