"use client";
import { Card, CardBody } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { MdOutlineCancel } from "react-icons/md";
import toast from "react-hot-toast";

import ConfirmationModal from "../confirmation";
import { PageSpinner } from "../pageSpinner";

import { deleteFriend, getFriends } from "@/lib/requests";
import { IUser } from "@/lib/models";
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
        className="w-full"
        onPress={() => {
          router.push(`/users/${friend.username}`);
        }}
      >
        <CardBody className="flex flex-row justify-between">
          <User
            key={friend.id}
            avatarProps={{
              src: friend.image,
              name: friend.name[0],
            }}
            className="cursor-pointer"
            description={friend.username}
            name={friend.name}
            onClick={() => {
              router.push(getUserLink(friend.username));
            }}
          />
          <Button
            isIconOnly
            color="danger"
            variant="flat"
            onPress={() => {
              setIsConfirm(true);
            }}
          >
            <MdOutlineCancel />
          </Button>
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
              f.id != friend.id;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {users}
      </div>
    );
  }
});

export default FriendsList;
