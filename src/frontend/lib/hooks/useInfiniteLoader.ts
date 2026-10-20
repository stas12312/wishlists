import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Начинаем подгрузку, когда до конца списка остаётся один экран
const DEFAULT_ROOT_MARGIN = "0px 0px 100% 0px";

/**
 * Бесконечная подгрузка: возвращает callback-ref для элемента-сентинела,
 * который размещается после списка.
 *
 * - observer создаётся заново только после успешной загрузки страницы,
 *   а не на каждом рендере;
 * - параллельные загрузки исключены;
 * - если после загрузки сентинел всё ещё в зоне подгрузки (короткая страница),
 *   сразу загружается следующая страница.
 */
export function useInfiniteLoader(
  onLoad: () => Promise<unknown> | void,
  {
    hasMore = true,
    rootMargin = DEFAULT_ROOT_MARGIN,
  }: { hasMore?: boolean; rootMargin?: string } = {},
) {
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const isLoadingRef = useRef(false);
  const onLoadRef = useRef(onLoad);

  useLayoutEffect(() => {
    onLoadRef.current = onLoad;
  });

  useEffect(() => {
    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || isLoadingRef.current) {
          return;
        }
        isLoadingRef.current = true;
        try {
          await onLoadRef.current();
          // Пересоздаём observer после рендера новой страницы:
          // его первый вызов проверит, нужна ли ещё одна страница.
          // При ошибке не пересоздаём, чтобы не уйти в цикл повторов.
          setLoadedCount((count) => count + 1);
        } finally {
          isLoadingRef.current = false;
        }
      },
      { rootMargin },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinel, hasMore, rootMargin, loadedCount]);

  return setSentinel;
}
