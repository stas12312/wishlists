"use client";
import { IUser } from "@/lib/models";
import { deleteFriend, getFriends } from "@/lib/requests";
import { Card, CardBody } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageSpinner } from "../pageSpinner";
import { Button } from "@nextui-org/button";
import { MdOutlineCancel } from "react-icons/md";
import ConfirmationModal from "../confirmation";
import toast from "react-hot-toast";
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
        onPress={() => {
          router.push(`/users/${friend.username}`);
        }}
        className="w-full"
      >
        <CardBody className="flex flex-row justify-between">
          <User
            className="cursor-pointer"
            onClick={() => {
              router.push(getUserLink(friend));
            }}
            key={friend.id}
            name={friend.name}
            description={friend.username}
            avatarProps={{
              src: friend.image,
              name: friend.name[0],
            }}
          ></User>
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
        message="Вы уверены, что хотите удалить пользователя из друзей?"
        onConfirm={async () => {
          await deleteFriend(friend.id);
          toast.success("Пользователь удален из друзей");
          setIsConfirm(false);
          setFriends(
            friends.filter((f) => {
              f.id != friend.id;
            })
          );
        }}
        isOpen={isConfirm}
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

