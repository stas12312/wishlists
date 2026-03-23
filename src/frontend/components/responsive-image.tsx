import Image from "next/image";
import { twMerge } from "tailwind-merge";

export const ResponsiveImage = ({
  src,
  alt = "Изображение",
  className,
  height = "0",
  width = "0",
}: {
  src: string;
  alt?: string;
  className: string;
  height?: number | `${number}` | undefined;
  width?: number | `${number}` | undefined;
}) => {
  return (
    <Image
      unoptimized
      alt={alt}
      className={twMerge("w-auto h-auto", className)}
      height={height}
      sizes="100vw"
      src={src}
      width={width}
    />
  );
};
