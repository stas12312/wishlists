"use client";
import { Skeleton } from "@heroui/skeleton";
import { User } from "@heroui/user";
import { useEffect, useState } from "react";
import { Chip } from "@heroui/chip";
import { observer } from "mobx-react-lite";
import { Link } from "@heroui/link";
import { MdCake } from "react-icons/md";
import { motion } from "framer-motion";

import UserStatus from "./status";

import { FriendStatus } from "@/lib/models";
import { getUserFriendsCount } from "@/lib/client-requests/user";
import { getUserByUsername } from "@/lib/client-requests/user";
import { getFriendStatus } from "@/lib/client-requests/friend";
import { IUser } from "@/lib/models/user";
import { wrapUsername } from "@/lib/user";
import { getLabelForCount, getUserLink } from "@/lib/label";
import { getDisplayDate } from "@/lib/date";
import userStore from "@/store/userStore";
import { defaultVariants } from "@/lib/animations/default";

const UserCard = observer(({ username }: { username: string }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<IUser>({} as IUser);
  const [friendStatus, setFriendStatus] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const me = await userStore.getMe();
      const responses = await Promise.all([
        getUserByUsername(username),
        me.id ? getUserFriendsCount(username) : null,
      ]);
      const responseUser = responses[0];
      if (userStore.user.id) {
        setFriendsCount(responses[1] ?? 0);
      }

      setUser(responseUser);
      if (userStore.user.id) {
        setFriendStatus(await getFriendStatus(responseUser.id));
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="flex justify-center flex-col my-4 gap-4">
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <motion.div
          animate="animate"
          className="flex justify-center flex-col"
          initial="initial"
          variants={defaultVariants}
        >
          <User
            avatarProps={{
              name: user.name?.length ? user.name[0] : "",
              src: user.image,
              size: "lg",
            }}
            description={
              <Link className="text-lg" href={getUserLink(user.username)}>
                <span>{wrapUsername(user.username)}</span>
              </Link>
            }
            name={<span className="text-2xl">{user.name}</span>}
          />
          <div className="mx-auto flex gap-1 mt-2 h-7">
            {user.birthday ? (
              <Chip
                color="secondary"
                startContent={<MdCake />}
                title={`День рождения ${getDisplayDate(user.birthday)}`}
              >
                {getDisplayDate(user.birthday)}
              </Chip>
            ) : null}
            {userStore.user.id ? (
              <UserStatus
                friendStatus={friendStatus}
                setFriendStatus={setFriendStatus}
                userId={user.id}
              />
            ) : null}
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
        </motion.div>
      )}
    </div>
  );
});

export default UserCard;

const CardSkeleton = () => {
  return (
    <div className="max-w-[200px] w-full flex flex-col mx-auto gap-1">
      <div className="flex gap-4 items-center mx-auto">
        <div>
          <Skeleton className="w-14 h-14 rounded-full" />
        </div>
        <div className="max-w-[120px] w-full flex flex-col gap-2">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
      </div>

      <div className="mx-auto justify-center flex gap-1 mt-2 h-7">
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-7 w-32  rounded-full" />
      </div>
    </div>
  );
};
