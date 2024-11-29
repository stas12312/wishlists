"use client";
import userStore from "@/store/userStore";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const UserItem = observer(() => {
  const user = userStore.user;
  useEffect(() => {
    userStore.fetchMe();
  }, []);

  return (
    <div>
      {user ? (
        <User
          name={user.name}
          description={user.email}
          avatarProps={{
            name: user.name?.length ? user.name[0] : "",
          }}
        />
      ) : null}
    </div>
  );
});
