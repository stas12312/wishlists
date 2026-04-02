"use client";
import { Card } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { usePress } from "react-aria";

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
  let { pressProps, isPressed } = usePress({
    onPress: () => router.push(getUserLink(friend.username)),
  });
  return (
    <Card
      className="w-full cursor-pointer p-3 data-[pressed=true]:scale-95 transition"
      {...pressProps}
      data-pressed={isPressed ? "true" : undefined}
    >
      <Card.Content className="flex flex-row justify-between">
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
