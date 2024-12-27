"use client";
import { IUser, IWishlist } from "@/lib/models";
import { getUserByUsername, getWishlists } from "@/lib/requests";
import { Divider } from "@nextui-org/divider";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { PageSpinner } from "./pageSpinner";
import { WishlistItem } from "./wishlist/card";

const UserView = observer(({ username }: { username: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<IUser>({} as IUser);
  const [wishlists, setWishlists] = useState<IWishlist[]>([]);

  useEffect(() => {
    async function fetchData() {
      const responseUser = await getUserByUsername(username);
      setUser(responseUser);
      setWishlists(
        await getWishlists({ showArchive: false, userId: responseUser.id })
      );
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    if (isLoading) {
      return <PageSpinner />;
    }
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
        <div className="col-span-full">
          <User
            name={user.name}
            description={user.username}
            avatarProps={{ src: user.image }}
          ></User>
        </div>
        <h1 className="text-2xl">Вишлисты пользователя</h1>
        <Divider className="col-span-full"></Divider>
        {components}
      </div>
    </>
  );
});

export default UserView;
