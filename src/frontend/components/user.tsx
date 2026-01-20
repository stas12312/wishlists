"use client";
import { User } from "@heroui/user";
import { observer } from "mobx-react-lite";
import { Key, useEffect } from "react";
import { addToast } from "@heroui/toast";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { MdLink, MdOutlineExitToApp, MdSettings } from "react-icons/md";
import { useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";

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
    userStore.fetchMe();
  }, []);

  function onHandleAction(key: Key) {
    if (key == "share") {
      navigator.clipboard.writeText(profileLink);
      addToast({
        title: "Ссылка на профиль скопирована",
      });
    }
    if (key == "settings") {
      router.push("/settings");
    }
  }

  return (
    <>
      {user ? (
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            {userStore.isLoading ? (
              <User description={user.email} name={user.name} />
            ) : (
              <User
                as="button"
                avatarProps={{
                  name: user.name?.length ? user.name[0] : "",
                  src: user.image,
                }}
                description={user.email}
                name={user.name}
              />
            )}
          </DropdownTrigger>
          <DropdownMenu variant="flat" onAction={onHandleAction}>
            <DropdownItem key="share" startContent={<MdLink />}>
              Ссылка на профиль
            </DropdownItem>
            <DropdownItem
              key="settings"
              showDivider
              startContent={<MdSettings />}
            >
              Настройки
            </DropdownItem>
            <DropdownItem
              key="logoun"
              className="text-danger"
              color="danger"
              startContent={<MdOutlineExitToApp />}
              onPress={async () => {
                userStore.logout();
                await logout();
              }}
            >
              Выйти
            </DropdownItem>
          </DropdownMenu>
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
  variant?:
    | "dot"
    | "solid"
    | "flat"
    | "shadow"
    | "bordered"
    | "faded"
    | "light"
    | undefined;
}) => {
  return (
    <Chip
      as={Link}
      avatar={<Avatar src={user.image} />}
      className={className}
      href={getUserLink(user.username)}
      variant={variant}
    >
      {user.name}
    </Chip>
  );
};
