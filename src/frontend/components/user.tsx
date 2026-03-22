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
  toast,
} from "@heroui/react";
import Link from "next/link";

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
      {user ? (
        <Dropdown>
          <Dropdown.Trigger>
            {userStore.isLoading ? (
              <UserAvatar description={user.email} name={user.name} size="sm" />
            ) : (
              <UserAvatar
                className="cursor-pointer"
                description={user.email}
                name={user.name}
                size="sm"
              />
            )}
          </Dropdown.Trigger>

          <Dropdown.Popover placement="bottom end">
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
      ) : null}
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
      className={`${chipStyle.base()} ${className}`}
      href={getUserLink(user.username)}
    >
      <Avatar>
        <Avatar.Image src={user.image} />
      </Avatar>
      {user.name}
    </Link>
  );
};
