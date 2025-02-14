"use client";
import { Skeleton } from "@heroui/skeleton";
import { User } from "@heroui/user";
import { useEffect, useState } from "react";
import { Chip } from "@heroui/chip";
import { observer } from "mobx-react-lite";
import { Link } from "@heroui/link";

import UserStatus from "./status";

import { FriendStatus } from "@/lib/models";
import { getUserFriendsCount } from "@/lib/requests/user";
import { getFriendStatus, getUserByUsername } from "@/lib/requests";
import { IUser } from "@/lib/models/user";
import { wrapUsername } from "@/lib/user";
import { getLabelForCount } from "@/lib/label";

const UserCard = observer(({ username }: { username: string }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<IUser>({} as IUser);
  const [friendStatus, setFriendStatus] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const responses = await Promise.all([
        getUserByUsername(username),
        getUserFriendsCount(username),
      ]);
      const responseUser = responses[0];
      setFriendsCount(responses[1]);

      setUser(responseUser);
      setFriendStatus(await getFriendStatus(responseUser.id));
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
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
            <div className="mx-auto justify-center mb-4 w-2/5 flex gap-1">
              <Skeleton className="h-7 w-1/5 rounded-full" />
              <Skeleton className="h-7 w-1/5 rounded-full" />
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
              description={
                <span className="text-lg">{wrapUsername(user.username)}</span>
              }
              name={<span className="text-2xl">{user.name}</span>}
            />
            <div className="mx-auto flex gap-1">
              {
                <UserStatus
                  friendStatus={friendStatus}
                  setFriendStatus={setFriendStatus}
                  userId={user.id}
                />
              }
              {friendStatus == FriendStatus.is_friend ||
              friendStatus == FriendStatus.is_yourself ? (
                <Chip
                  as={Link}
                  href={
                    friendStatus == FriendStatus.is_friend
                      ? `/users/${username}/friends`
                      : `/friends`
                  }
                >
                  {friendsCount}{" "}
                  {getLabelForCount(friendsCount, ["друг", "друга", "друзей"])}
                </Chip>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default UserCard;
