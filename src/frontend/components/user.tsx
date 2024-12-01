"use client";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import userStore from "@/store/userStore";

export const UserItem = observer(() => {
  const user = userStore.user;

  useEffect(() => {
    userStore.fetchMe();
  }, []);

  return (
    <div>
      {user ? (
        <User
          avatarProps={{
            name: user.name?.length ? user.name[0] : "",
          }}
          description={user.email}
          name={user.name}
        />
      ) : null}
    </div>
  );
});
