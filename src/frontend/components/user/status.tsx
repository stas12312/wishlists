"use client";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";

import { FriendStatus } from "@/lib/models";
import { AddFriend } from "@/lib/requests";

const UserStatus = ({
  friendStatus,
  userId,
  setFriendStatus,
}: {
  friendStatus: FriendStatus;
  userId: number;
  setFriendStatus: { (status: FriendStatus): void };
}) => {
  let item;
  switch (friendStatus) {
    case FriendStatus.no_friend:
      item = (
        <Button
          variant="ghost"
          onPress={async () => {
            const result = await AddFriend(userId);
            if (result && "code" in result) {
              addToast({
                title: result.message,
                color: "danger",
              });
            } else {
              addToast({
                title: "Заяка отправлена",
              });
              setFriendStatus(FriendStatus.has_outcoming_request);
            }
          }}
        >
          Добавить в друзья
        </Button>
      );
      break;
    case FriendStatus.has_incoming_request:
      item = <Chip color="warning">Отправил вам заявку в друзья</Chip>;
      break;
    case FriendStatus.has_outcoming_request:
      item = <Chip color="warning">Заявка отправлена</Chip>;
      break;
    case FriendStatus.is_friend:
      item = <Chip color="success">Ваш друг</Chip>;
      break;
    case FriendStatus.is_yourself:
      item = <Chip color="success">Вы</Chip>;
  }

  return <div className="h-10">{item}</div>;
};

export default UserStatus;
