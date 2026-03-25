import { Avatar } from "@heroui/react";
import { ReactNode } from "react";

export const UserAvatar = ({
  image,
  name,
  className,
  description,
  size = "md",
  avatarClassName = "",
}: {
  image?: string;
  name: ReactNode;
  className?: string;
  description?: ReactNode;
  size?: "sm" | "md" | "lg";
  avatarClassName?: string;
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Avatar className={avatarClassName} size={size}>
        <Avatar.Image alt="" src={image} />
        <Avatar.Fallback>JG</Avatar.Fallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <span className="text-sm">{name}</span>
        <span className="text-xs text-muted">{description}</span>
      </div>
    </div>
  );
};
