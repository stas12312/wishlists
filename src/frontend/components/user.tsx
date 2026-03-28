"use client";
import { observer } from "mobx-react-lite";
import { Key, useEffect } from "react";
import { MdLink, MdOutlineExitToApp, MdSettings } from "react-icons/md";
import { useRouter } from "next/navigation";
import {
  Avatar,
  chipVariants,
  Dropdown,
  Label,
  Separator,
  Skeleton,
  toast,
} from "@heroui/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

import { ThemeSwitcher } from "./themeSwitcher";
import { UserAvatar } from "./userAvatar";

import userStore from "@/store/userStore";
import { logout } from "@/lib/auth";
import { IUser } from "@/lib/models/user";
import { getUserLink } from "@/lib/label";
export const UserItem = observer(() => {
  const user = userStore.user;
  let profileLink = "";
  const router = useRouter();
  if (user.username) {
    profileLink = `${window.location.origin}/users/${user.username}`;
  }
  useEffect(() => {
    userStore.getMe();
  }, []);

  function onHandleAction(key: Key) {
    if (key == "share") {
      navigator.clipboard.writeText(profileLink);
      toast.success("Ссылка на профиль скопирована");
    }
    if (key == "settings") {
      router.push("/settings");
    }
  }
  return (
    <>
      {user.id ? (
        <Dropdown>
          <Dropdown.Trigger>
            <UserAvatar
              className="cursor-pointer"
              description={user.email}
              image={user.image}
              name={user.name}
              size="md"
            />
          </Dropdown.Trigger>

          <Dropdown.Popover className="min-w-62.5" placement="bottom end">
            <div className="p-2">
              <ThemeSwitcher />
            </div>

            <Dropdown.Menu
              disabledKeys={["theme-switcher"]}
              onAction={onHandleAction}
            >
              <Separator />
              <Dropdown.Item id="share">
                <MdLink />
                <Label>Ссылка на профиль</Label>
              </Dropdown.Item>
              <Dropdown.Item id="settings">
                <MdSettings />
                <Label>Настройки</Label>
              </Dropdown.Item>
              <Separator />
              <Dropdown.Item
                className="text-danger"
                id="logoun"
                variant="danger"
                onPress={async () => {
                  userStore.logout();
                  await logout();
                }}
              >
                <MdOutlineExitToApp />
                <Label>Выйти</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      ) : (
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-3xl" />
          <div className="flex flex-col gap-2 my-auto">
            <Skeleton className="h-4 w-20 rounded-3xl" />
            <Skeleton className="h-3 w-24 rounded-3xl" />
          </div>
        </div>
      )}
    </>
  );
});

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
      className={twMerge(chipStyle.base(), className)}
      href={getUserLink(user.username)}
    >
      <Avatar size="md">
        <Avatar.Image className="object-cover" src={user.image} />
      </Avatar>
      <span className="text-sm">{user.name}</span>
    </Link>
  );
};
