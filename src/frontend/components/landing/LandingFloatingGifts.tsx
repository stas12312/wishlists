import {
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const GIFTS_COUNT = 8;
const EMOJIS = ["🎁", "🎁", "🎁", "🎀", "🎉"];
const POINTER_SHIFT = 40;
const SCROLL_SHIFT = 300;
// Free space beside the max-w-300 content column; negative on narrow screens, which hides gifts
const SIDE_MARGIN = "(100% - 75rem) / 2";

type Gift = {
  id: number;
  emoji: string;
  isLeft: boolean;
  marginOffset: number;
  top: number;
  depth: number;
  duration: number;
  delay: number;
  float: number;
  rotate: number;
};

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const createGifts = (): Gift[] =>
  Array.from({ length: GIFTS_COUNT }, (_, id) => ({
    id,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    // Alternate sides and spread evenly down the page so gifts accompany the whole scroll
    isLeft: id % 2 === 0,
    // Alternate between the outer and inner half of the margin so gifts on one side don't line up in a column
    marginOffset:
      Math.floor(id / 2) % 2 === 0
        ? randomBetween(0.15, 0.45)
        : randomBetween(0.55, 0.85),
    top: ((id + randomBetween(0.2, 0.8)) / GIFTS_COUNT) * 100,
    depth: randomBetween(0.2, 1),
    duration: randomBetween(4, 7),
    delay: randomBetween(0, 3),
    float: randomBetween(10, 25),
    rotate: randomBetween(5, 15),
  }));

const FloatingGift = ({
  gift,
  pointerX,
  pointerY,
}: {
  gift: Gift;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Closer gifts (higher depth) move more, which creates the parallax effect
  const x = useTransform(pointerX, (v) => v * gift.depth * POINTER_SHIFT);
  const y = useTransform(
    [pointerY, scrollYProgress],
    ([py, progress]: number[]) =>
      py * gift.depth * POINTER_SHIFT -
      (progress - 0.5) * gift.depth * SCROLL_SHIFT,
  );

  return (
    <div
      ref={ref}
      className="absolute -translate-x-1/2"
      style={{
        left: gift.isLeft
          ? `calc(${SIDE_MARGIN} * ${gift.marginOffset})`
          : `calc(100% - ${SIDE_MARGIN} * ${gift.marginOffset})`,
        top: `${gift.top}%`,
        zIndex: Math.round(gift.depth * 10),
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        style={{
          x,
          y,
          filter: gift.depth < 0.4 ? "blur(1px)" : undefined,
        }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 0.4 + gift.depth * 0.5, scale: 1 }}
      >
        <motion.span
          animate={{
            y: [0, -gift.float, 0],
            rotate: [-gift.rotate, gift.rotate, -gift.rotate],
          }}
          className="block drop-shadow-md"
          style={{ fontSize: `${1.5 + gift.depth * 2}rem` }}
          transition={{
            duration: gift.duration,
            delay: gift.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {gift.emoji}
        </motion.span>
      </motion.div>
    </div>
  );
};

export const FloatingGifts = () => {
  const shouldReduceMotion = useReducedMotion();
  // Generated on the client only to avoid hydration mismatch
  const [gifts, setGifts] = useState<Gift[]>([]);
  const rawPointerX = useMotionValue(0);
  const rawPointerY = useMotionValue(0);
  const pointerX = useSpring(rawPointerX, { stiffness: 50, damping: 20 });
  const pointerY = useSpring(rawPointerY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    setGifts(createGifts());

    const onPointerMove = (event: PointerEvent) => {
      rawPointerX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawPointerY.set((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", onPointerMove);

    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [rawPointerX, rawPointerY]);

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {gifts.map((gift) => (
        <FloatingGift
          key={gift.id}
          gift={gift}
          pointerX={pointerX}
          pointerY={pointerY}
        />
      ))}
    </div>
  );
};
