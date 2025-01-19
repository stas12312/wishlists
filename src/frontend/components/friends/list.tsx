"use client";
import { Card, CardBody } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ConfirmationModal from "../confirmation";
import { PageSpinner } from "../pageSpinner";

import FriendMenu from "./menu";

import { deleteFriend, getFriends } from "@/lib/requests";
import { IUser } from "@/lib/models/user";
import { getUserLink } from "@/lib/label";

const FriendsList = observer(() => {
  const router = useRouter();
  const [friends, setFriends] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirm, setIsConfirm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setFriends(await getFriends());
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!friends.length) {
    return <h2 className="text-2xl text-center">Список пуст</h2>;
  }

  const users = friends.map((friend) => (
    <div key={friend.id}>
      <Card
        isPressable
        className="w-full md:hover:scale-[1.03]"
        onPress={() => {
          router.push(getUserLink(friend.username));
        }}
      >
        <CardBody className="flex flex-row justify-between">
          <User
            avatarProps={{
              src: friend.image,
              name: friend.name[0],
            }}
            className="cursor-pointer"
            description={friend.username}
            name={friend.name}
          />
          <FriendMenu
            handleAction={(action) => {
              if (action == "delete") {
                setIsConfirm(true);
              }
            }}
          />
        </CardBody>
      </Card>
      <ConfirmationModal
        isOpen={isConfirm}
        message="Вы уверены, что хотите удалить пользователя из друзей?"
        onConfirm={async () => {
          await deleteFriend(friend.id);
          toast.success("Пользователь удален из друзей");
          setIsConfirm(false);
          setFriends(
            friends.filter((f) => {
              return f.id != friend.id;
            }),
          );
        }}
        onDecline={() => {
          setIsConfirm(false);
        }}
      />
    </div>
  ));
  if (friends) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users}
      </div>
    );
  }
});

export default FriendsList;
