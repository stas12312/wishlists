"use client";
import { Card, CardBody } from "@heroui/card";
import { User } from "@heroui/user";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

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
      isPressable
      className="w-full"
      onPress={() => {
        router.push(getUserLink(friend.username));
      }}
    >
      <CardBody className="flex flex-row justify-between">
        <User
          avatarProps={{
            src: friend.image,
            name: friend.name[0],
          }}
          className="cursor-pointer"
          description={wrapUsername(friend.username)}
          name={friend.name}
        />
        {children}
      </CardBody>
    </Card>
  );
};

export default FriendItem;
