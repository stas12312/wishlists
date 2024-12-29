"use client";
import { FriendStatus, IUser, IWishlist } from "@/lib/models";
import {
  AddFriend,
  getFriendStatus,
  getUserByUsername,
  getWishlists,
} from "@/lib/requests";
import { Divider } from "@nextui-org/divider";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { PageSpinner } from "./pageSpinner";
import { WishlistItem } from "./wishlist/card";
import { Button } from "@nextui-org/button";
import toast from "react-hot-toast";
import { Chip } from "@nextui-org/chip";
import { Tienne } from "next/font/google";
import userStore from "@/store/userStore";

const UserView = observer(({ username }: { username: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<IUser>({} as IUser);
  const [wishlists, setWishlists] = useState<IWishlist[]>([]);
  const [friendStatus, setFriendStatus] = useState(0);
  const currentUser = userStore.user.id;

  useEffect(() => {
    async function fetchData() {
      const responseUser = await getUserByUsername(username);
      setUser(responseUser);
      setWishlists(
        await getWishlists({ showArchive: false, userId: responseUser.id })
      );
      setFriendStatus(await getFriendStatus(responseUser.id));
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <PageSpinner />;
  }

  const components = wishlists.map((wishlist: IWishlist) => (
    <span key={wishlist.uuid}>
      <WishlistItem
        wishlist={wishlist}
        onDelete={() => {}}
        onRestore={() => {}}
        edit={false}
      />
    </span>
  ));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-full flex justify-center flex-col gap-2">
          <User
            avatarProps={{
              name: user.name?.length ? user.name[0] : "",
              src: user.image,
              size: "lg",
            }}
            description={<span className="text-lg">{user.username}</span>}
            name={<span className="text-2xl">{user.name}</span>}
          ></User>
          <div className="mx-auto">
            {
              <UserItem
                friendStatus={friendStatus}
                userId={user.id}
                setFriendStatus={setFriendStatus}
              />
            }
          </div>
        </div>
        <h1 className="text-2xl">Вишлисты пользователя</h1>
        <Divider className="col-span-full"></Divider>
        {components}
      </div>
    </>
  );
});

export default UserView;

const UserItem = ({
  friendStatus,
  userId,
  setFriendStatus,
}: {
  friendStatus: FriendStatus;
  userId: number;
  setFriendStatus: { (status: FriendStatus): void };
}) => {
  let item;
  switch (friendStatus) {
    case FriendStatus.no_friend:
      item = (
        <Button
          variant="ghost"
          onPress={async () => {
            const result = await AddFriend(userId);
            if (result && "code" in result) {
              toast.error(result.message);
            } else {
              toast.success("Заявка отправлена");
              setFriendStatus(FriendStatus.has_outcoming_request);
            }
          }}
        >
          Добавить в друзья
        </Button>
      );
      break;
    case FriendStatus.has_incoming_request:
      item = <Chip color="warning">Отправил вам заявку в друзья</Chip>;
      break;
    case FriendStatus.has_outcoming_request:
      item = <Chip color="warning">Заявка отправлена</Chip>;
      break;
    case FriendStatus.is_friend:
      item = <Chip color="success">Ваш друг</Chip>;
      break;
    case FriendStatus.is_yourself:
      item = <Chip color="success">Вы</Chip>;
  }

  return item;
};
