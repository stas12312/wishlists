"use client";

import { Button, Chip, toast } from "@heroui/react";

import { FriendStatus } from "@/lib/models";
import { AddFriend } from "@/lib/client-requests/friend";

const UserStatus = ({
  friendStatus,
  userId,
  setFriendStatus,
  className,
}: {
  friendStatus: FriendStatus;
  userId: number;
  setFriendStatus: { (status: FriendStatus): void };
  className?: string;
}) => {
  let item;
  switch (friendStatus) {
    case FriendStatus.no_friend:
      item = (
        <Button
          className="h-7"
          variant="primary"
          onPress={async () => {
            const result = await AddFriend(userId);
            if (result && "code" in result) {
              toast.danger(result.message);
            } else {
              toast.success("Заявка отправлена");
              setFriendStatus(FriendStatus.has_outcoming_request);
            }
          }}
        >
          Добавить в друзья
        </Button>
      );
      break;
    case FriendStatus.has_incoming_request:
      item = (
        <Chip color="warning" size="lg">
          Отправил вам заявку в друзья
        </Chip>
      );
      break;
    case FriendStatus.has_outcoming_request:
      item = (
        <Chip color="warning" size="lg">
          Заявка отправлена
        </Chip>
      );
      break;
    case FriendStatus.is_friend:
      item = (
        <Chip color="success" size="lg">
          Ваш друг
        </Chip>
      );
      break;
    case FriendStatus.is_yourself:
      item = (
        <Chip color="success" size="lg">
          Вы
        </Chip>
      );
  }
  return <div className={className}>{item}</div>;
};

export default UserStatus;
