"use client";
import { Chip, Skeleton } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { MdCake } from "react-icons/md";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserAvatar } from "./UserAvatar";
import UserStatus from "./UserStatus";

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
  const pathname = usePathname();
  const hasLoaded = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<IUser>({} as IUser);
  const [friendStatus, setFriendStatus] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const me = await userStore.getMe();
        if (cancelled) return;

        const [responseUser, count] = await Promise.all([
          getUserByUsername(username),
          me.id ? getUserFriendsCount(username) : 0,
        ]);
        if (cancelled) return;
        if ("message" in responseUser) {
          throw new Error(responseUser.message);
        }

        const status = me.id ? await getFriendStatus(responseUser.id) : 0;
        if (cancelled) return;

        setUser(responseUser);
        setFriendsCount(count);
        setFriendStatus(status);
        setError("");
        hasLoaded.current = true;
      } catch (error) {
        // Ошибка фонового обновления не должна скрывать уже загруженную карточку.
        if (!cancelled && !hasLoaded.current) {
          setError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить профиль пользователя",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();

    return () => {
      cancelled = true;
    };
  }, [username, pathname]);

  if (error) {
    return <h2 className="text-center text-2xl my-4 text-bold">{error}</h2>;
  }

  return (
    <div className="justify-center  my-4 gap-4 rounded-3xl p-4">
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <motion.div
          animate="animate"
          className="flex justify-center flex-col items-center"
          initial="initial"
          variants={defaultVariants}
        >
          <UserAvatar
            avatarClassName={"h-[56px] w-[56px]"}
            description={
              <Link
                className="text-lg text-accent"
                href={getUserLink(user.username)}
              >
                <span>{wrapUsername(user.username)}</span>
              </Link>
            }
            image={user.image}
            name={user.name}
            nameClassName="text-xl"
            size="lg"
          />
          <div className="mx-auto flex gap-1 mt-2 h-7">
            {user.birthday ? (
              <Chip
                color="warning"
                size="lg"
                title={`День рождения ${getDisplayDate(user.birthday)}`}
                variant="primary"
              >
                <MdCake />
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
              <Link
                className="chip chip--primary chip--lg"
                href={
                  friendStatus == FriendStatus.is_friend
                    ? `/users/${username}/friends`
                    : `/friends`
                }
              >
                {friendsCount}{" "}
                {getLabelForCount(friendsCount, ["друг", "друга", "друзей"])}
              </Link>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  );
});

export default UserCard;

export function UserCardSkeleton() {
  return (
    <div className="justify-center my-4 gap-4 rounded-3xl p-4">
      <CardSkeleton />
    </div>
  );
}

const CardSkeleton = () => {
  return (
    <div className="max-w-50 w-full flex flex-col mx-auto">
      <div className="flex gap-4 items-center mx-auto">
        <div>
          <Skeleton className="w-14 h-14 rounded-full" />
        </div>
        <div className="max-w-30 w-full flex flex-col gap-2">
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
