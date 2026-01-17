"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { addToast } from "@heroui/toast";

import { PageSpinner } from "../pageSpinner";
import ConfirmationModal from "../confirmation";

import FriendItem from "./card";
import FriendMenu from "./menu";

import { IUser } from "@/lib/models/user";
import { getUserFriends } from "@/lib/client-requests/user";
import { getFriends } from "@/lib/client-requests/friend";
import { deleteFriend } from "@/lib/client-requests/friend";

const FriendsList = observer(
  ({
    username,
    withMenu = false,
  }: {
    username?: string;
    withMenu?: boolean;
  }) => {
    const successFunction = useRef<{ (): void }>();
    const [friends, setFriends] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isConfirm, setIsConfirm] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
      async function fetchData() {
        if (username) {
          const friends = await getUserFriends(username);
          if ("message" in friends) {
            setError(friends.message);
          } else {
            setFriends(friends);
          }
        } else {
          setFriends(await getFriends());
        }
        setIsLoading(false);
      }
      fetchData();
    }, []);

    if (isLoading) {
      return <PageSpinner />;
    }
    if (error) {
      return <h2 className="text-2xl text-center">{error}</h2>;
    }

    if (!friends.length) {
      return <h2 className="text-2xl text-center">Список пуст</h2>;
    }

    const users = friends.map((friend) => (
      <div key={friend.id} className="md:hover:scale-[1.03] duration-200">
        <FriendItem friend={friend}>
          {withMenu ? (
            <FriendMenu
              handleAction={async (action) => {
                if (action == "delete") {
                  successFunction.current = async () => {
                    await deleteFriend(friend.id);
                    addToast({
                      title: "Пользователь удален из друзей",
                    });
                    setIsConfirm(false);
                    setFriends(
                      friends.filter((f) => {
                        return f.id != friend.id;
                      }),
                    );
                  };
                  setIsConfirm(true);
                }
              }}
            />
          ) : null}
        </FriendItem>
      </div>
    ));
    if (friends) {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users}
          </div>
          <ConfirmationModal
            isOpen={isConfirm}
            message="Вы уверены, что хотите удалить пользователя из друзей?"
            onConfirm={
              successFunction.current ? successFunction.current : () => {}
            }
            onDecline={() => {
              setIsConfirm(false);
            }}
          />
        </>
      );
    }
  },
);

export default FriendsList;
