import { Avatar, Badge } from "@heroui/react";
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
  hasBadge = false,
}: {
  image?: string;
  name: string;
  className?: string;
  description?: ReactNode;
  size?: "sm" | "md" | "lg";
  avatarClassName?: string;
  nameClassName?: string;
  hasBadge?: boolean;
}) => {
  return (
    <div className={twMerge("flex items-center gap-2", className)}>
      <Avatar className={avatarClassName} size={size}>
        <Avatar.Image alt="" className="object-cover" src={image} />
        <Avatar.Fallback>{name.length ? name[0] : null}</Avatar.Fallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <Badge.Anchor>
          <span className={nameClassName}>{name}</span>
          {hasBadge ? (
            <Badge className="-mr-2.5" color="accent" content="" size="sm" />
          ) : null}
        </Badge.Anchor>
        <span className="text-xs text-muted">{description}</span>
      </div>
    </div>
  );
};
