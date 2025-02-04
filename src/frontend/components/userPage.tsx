"use client";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Skeleton } from "@heroui/skeleton";

import { Wishlists } from "./wishlist/list";
import PageHeader from "./pageHeader";

import { AddFriend, getFriendStatus, getUserByUsername } from "@/lib/requests";
import { FriendStatus } from "@/lib/models";
import { IUser } from "@/lib/models/user";

const UserView = observer(({ username }: { username: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<IUser>({} as IUser);
  const [friendStatus, setFriendStatus] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const responseUser = await getUserByUsername(username);
      setUser(responseUser);
      setFriendStatus(await getFriendStatus(responseUser.id));
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        <div className="col-span-full flex justify-center flex-col gap-2">
          {isLoading ? (
            <>
              <div className="max-w-[200px] w-full flex items-center gap-3 mx-auto">
                <div>
                  <Skeleton className="w-14 h-14 rounded-full" />
                </div>
                <div className="max-w-[120px] w-full flex flex-col gap-2">
                  <Skeleton className="h-8 w-4/5 rounded-full" />
                  <Skeleton className="h-5 w-5/5 rounded-full" />
                </div>
              </div>
              <div className="mx-auto mb-4 w-2/5">
                <Skeleton className="h-7 w-1/5 rounded-full mx-auto" />
              </div>
            </>
          ) : (
            <div className="mb-4 flex justify-center flex-col gap-2">
              <User
                avatarProps={{
                  name: user.name?.length ? user.name[0] : "",
                  src: user.image,
                  size: "lg",
                }}
                description={<span className="text-lg">{user.username}</span>}
                name={<span className="text-2xl">{user.name}</span>}
              />
              <div className="mx-auto">
                {
                  <UserItem
                    friendStatus={friendStatus}
                    setFriendStatus={setFriendStatus}
                    userId={user.id}
                  />
                }
              </div>
            </div>
          )}
        </div>
      </div>
      <PageHeader>Вишлисты пользователя</PageHeader>

      {user.id ? (
        <Wishlists actions={{ edit: false, filter: false }} userId={user.id} />
      ) : null}
    </>
  );
});

export default UserView;

const UserItem = ({
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
              toast.error(result.message);
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

  return item;
};
