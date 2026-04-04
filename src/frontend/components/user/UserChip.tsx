import { Avatar, chipVariants } from "@heroui/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

import { getUserLink } from "@/lib/label";
import { IUser } from "@/lib/models/user";

export const UserChip = ({
  user,
  className,
  variant,
}: {
  user: IUser;
  className?: string;
  href?: string;
  variant?: "primary" | "secondary" | "soft" | "tertiary" | undefined;
}) => {
  const chipStyle = chipVariants({ variant: variant });
  return (
    <Link
      className={twMerge(
        chipStyle.base(),
        className,
        "pl-0.5 rounded-full h-8",
      )}
      href={getUserLink(user.username)}
    >
      {user.image ? (
        <Avatar className="h-7 w-7">
          <Avatar.Image className="object-cover" src={user.image} />
          <Avatar.Fallback>{user.name ? user.name[0] : null}</Avatar.Fallback>
        </Avatar>
      ) : null}

      <span className="text-sm">{user.name}</span>
    </Link>
  );
};
