import { Avatar } from "@heroui/react";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const UserAvatar = ({
  image,
  name,
  className,
  description,
  size = "md",
  avatarClassName = "",
  nameClassName = "",
}: {
  image?: string;
  name: string;
  className?: string;
  description?: ReactNode;
  size?: "sm" | "md" | "lg";
  avatarClassName?: string;
  nameClassName?: string;
}) => {
  return (
    <div className={twMerge("flex items-center gap-2", className)}>
      <Avatar className={avatarClassName} size={size}>
        <Avatar.Image alt="" className="object-cover" src={image} />
        <Avatar.Fallback>{name.length ? name[0] : null}</Avatar.Fallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <span className={nameClassName}>{name}</span>
        <span className="text-xs text-muted">{description}</span>
      </div>
    </div>
  );
};
