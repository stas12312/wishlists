"use client";
import { User } from "@heroui/user";
import { observer } from "mobx-react-lite";
import { Key, useEffect } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { MdLink, MdOutlineExitToApp } from "react-icons/md";
import toast from "react-hot-toast";

import userStore from "@/store/userStore";
import { logout } from "@/lib/auth";

export const UserItem = observer(() => {
  const user = userStore.user;
  let profileLink = "";
  if (user.username) {
    profileLink = `${window.location.origin}/users/${user.username}`;
  }
  useEffect(() => {
    userStore.fetchMe();
  }, []);

  function onHandleAction(key: Key) {
    if (key == "share") {
      navigator.clipboard.writeText(profileLink);
      toast.success("Ссылка на профиль скопирована");
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
