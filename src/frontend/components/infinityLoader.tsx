import { createRef, ReactNode, useEffect, useRef } from "react";

export const InfinityLoader = ({
  children,
  onLoad,
}: {
  children: ReactNode;
  onLoad: { (): void };
}) => {
  const observerLoader = useRef<IntersectionObserver | null>(null);
  const lastItem = createRef<HTMLDivElement>();

  useEffect(() => {
    if (observerLoader.current) {
      observerLoader.current.disconnect();
    }
    observerLoader.current = new IntersectionObserver(
      async (entries: any[]) => {
        if (entries[0].isIntersecting) {
          await onLoad();
        }
      },
    );

    if (lastItem.current) {
      observerLoader.current.observe(lastItem.current);
    }
  }, [lastItem]);
  return (
    <>
      {children}
      <div ref={lastItem} />
    </>
  );
};
