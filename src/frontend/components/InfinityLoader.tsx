import { ReactNode } from "react";

import { useInfiniteLoader } from "@/lib/hooks/useInfiniteLoader";

export const InfinityLoader = ({
  children,
  onLoad,
  hasMore,
  sentinelClassName,
}: {
  children: ReactNode;
  onLoad: { (): Promise<unknown> | void };
  hasMore: boolean;
  sentinelClassName?: string;
}) => {
  const sentinelRef = useInfiniteLoader(onLoad, { hasMore });

  return (
    <>
      {children}
      <div ref={sentinelRef} className={sentinelClassName} />
    </>
  );
};
