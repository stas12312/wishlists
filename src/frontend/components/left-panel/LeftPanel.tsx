"use client";
import clsx from "clsx";
import { ReactNode } from "react";

import { useHeader } from "@/providers/HeaderProviders";

export const LeftPanel = ({ children }: { children: ReactNode }) => {
  const { isVisible } = useHeader();
  return (
    <div className="hidden md:block col-span-full flex-col w-80">
      <div
        className={clsx(
          "sticky hidden md:block ml-2",
          isVisible ? "top-22" : "top-4",
        )}
      >
        {children}
      </div>
    </div>
  );
};
