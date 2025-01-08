"use client";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { Key, useEffect } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { MdLink } from "react-icons/md";
import toast from "react-hot-toast";

import userStore from "@/store/userStore";

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
            <User
              as="button"
              avatarProps={{
                name: user.name?.length ? user.name[0] : "",
                src: user.image,
              }}
              description={user.email}
              name={user.name}
            />
          </DropdownTrigger>
          <DropdownMenu variant="flat" onAction={onHandleAction}>
            <DropdownItem key="share" startContent={<MdLink />}>
              Ссылка на профиль
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : null}
    </>
  );
});
