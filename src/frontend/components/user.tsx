"use client";
import { IUser } from "@/lib/models";
import { getUser } from "@/lib/requests";
import { User } from "@nextui-org/user";
import { useEffect, useState } from "react";

export default function UserItem() {
  const [user, setUser] = useState<IUser>({} as IUser);

  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      setUser(user);
    }
    console.log("Получение пользователя");
    fetchUser();
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
      ) : (
        <span></span>
      )}
    </div>
  );
}
