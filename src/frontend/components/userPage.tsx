"use client";
import { IUser, IWishlist } from "@/lib/models";
import { getUserById, getWishlists } from "@/lib/requests";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { WishlistItem } from "./wishlist/card";
import { Divider } from "@nextui-org/divider";
import { PageSpinner } from "./pageSpinner";

const UserView = observer(({ userId }: { userId: number }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<IUser>({} as IUser);
  const [wishlists, setWishlists] = useState<IWishlist[]>([]);

  useEffect(() => {
    async function fetchData() {
      setUser(await getUserById(userId));
      setWishlists(await getWishlists({ showArchive: false, userId: userId }));
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

  console.log(user.name);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-full">
          <User name={user.name}></User>
        </div>
        <h1 className="text-2xl">Вишлисты пользователя</h1>
        <Divider className="col-span-full"></Divider>
        {components}
      </div>
    </>
  );
});

export default UserView;

