"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { useDisclosure } from "@nextui-org/modal";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { VisibleStatus } from "./visibleIcon";
import { WishItem } from "./wish/card";
import WishSaveModal from "./wish/saveModal";

import userStore from "@/store/userStore";
import { getWishes, getWishlist } from "@/lib/requests";
import { IWish, IWishlist } from "@/lib/models";
import toast from "react-hot-toast";

const WishlistDetail = observer((proprs: { wishlist: IWishlist }) => {
  const wishlist = proprs.wishlist;

  return (
    <div className="text-center lg:text-left">
      <div className="flex flex-row gap-2 justify-center lg:justify-start">
        <span className={"text-2xl"}>{wishlist.name}</span>
        <span>
          <VisibleStatus visible={wishlist.visible} />
        </span>
      </div>

      <p className={"text-default-500"}>{wishlist.description}</p>
    </div>
  );
});

const Wishes = observer(({ wishlistUUID }: { wishlistUUID: string }) => {
  const [items, setItems] = useState<IWish[]>([]);
  const [wishlist, setWishlist] = useState<IWishlist>({} as IWishlist);
  const isEditable = userStore.user.id == wishlist.user_id;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    async function fetchWishlists() {
      const response = await Promise.all([
        getWishes(wishlistUUID),
        getWishlist(wishlistUUID),
      ]);

      setItems(response[0]);
      setWishlist(response[1]);
    }
    fetchWishlists();
  }, []);

  function onDeleteWish(wish: IWish) {
    setItems(
      items.filter((value) => {
        return value.uuid !== wish.uuid;
      })
    );
    toast.success("Желание удалено");
  }

  async function onCreateWish(wish: IWish) {
    onOpenChange();
    items.push(wish);
  }

  const components = items.map((wish: IWish) => (
    <div key={wish.uuid}>
      <WishItem isEditable={isEditable} wish={wish} onDelete={onDeleteWish} />
    </div>
  ));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      <div className="col-span-full">
        <WishlistDetail wishlist={wishlist} />
      </div>
      <Divider className="my-4 col-span-full" />
      {isEditable ? (
        <Button
          fullWidth
          className="col-span-full"
          color="primary"
          onPress={onOpen}
        >
          Добавить
        </Button>
      ) : null}

      <WishSaveModal
        isOpen={isOpen}
        wishlistUUID={wishlistUUID}
        onOpenChange={onOpenChange}
        onUpdate={onCreateWish}
      />
      {components}
    </div>
  );
});

export default Wishes;
