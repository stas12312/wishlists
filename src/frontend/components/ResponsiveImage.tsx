"use client";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const GRADIENT_CLASS = clsx(
  "bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f8_35%,#ececee_100%)]",
  "dark:bg-[linear-gradient(180deg,#1c1c1e_0%,#2c2c2e_40%,#3a3a3c_100%)]",
);

export const ResponsiveImage = ({
  src,
  alt = "Изображение",
  className = "",
  height = "0",
  width = "0",
  fill = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  height?: number | `${number}` | undefined;
  width?: number | `${number}` | undefined;
  fill?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={clsx(
        "relative rounded-3xl",
        className,
        !isLoading ? GRADIENT_CLASS : null,
      )}
    >
      {isLoading && (
        <div
          className={twMerge(
            "absolute inset-0 w-full h-full animate-pulse rounded-3xl",
            GRADIENT_CLASS,
          )}
        />
      )}
      <Image
        unoptimized
        alt={alt}
        className={twMerge(
          "h-auto w-auto transition-opacity duration-300 rounded-3xl object-cover",
          isLoading ? "opacity-0" : "opacity-100",
        )}
        sizes="100vw"
        src={src}
        {...(fill
          ? { fill: true }
          : { width: width || 500, height: height || 500 })}
        onError={() => {
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
