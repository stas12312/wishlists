"use client";
import { Card } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

import { UserAvatar } from "../userAvatar";

import { IUser } from "@/lib/models/user";
import { getUserLink } from "@/lib/label";
import { wrapUsername } from "@/lib/user";

const FriendItem = ({
  friend,
  children,
}: {
  friend: IUser;
  children: ReactNode;
}) => {
  const router = useRouter();
  return (
    <Card
      className="w-full"
      role="button"
      onClick={() => {
        router.push(getUserLink(friend.username));
      }}
    >
      <Card.Content className="flex flex-row justify-between overflow-hidden">
        <span className="h-10 truncate">
          <UserAvatar
            className="cursor-pointer"
            description={wrapUsername(friend.username)}
            image={friend.image}
            name={friend.name}
          />
        </span>

        {children}
      </Card.Content>
    </Card>
  );
};

export default FriendItem;
