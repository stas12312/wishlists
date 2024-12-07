"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { useDisclosure } from "@nextui-org/modal";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { VisibleStatus } from "./visibleIcon";
import { WishItem } from "./wish/card";
import WishSaveModal from "./wish/saveModal";

import { IWish, IWishlist } from "@/lib/models";
import {
  deleteWishlist,
  getWishes,
  getWishlist,
  updateWishlist,
} from "@/lib/requests";
import userStore from "@/store/userStore";
import toast from "react-hot-toast";
import { WishlistItemMenu } from "./wishlist/card";
import { useRouter } from "next/navigation";

const WishlistDetail = observer(
  ({
    wishlist,
    onUpdate,
    onDelete,
  }: {
    wishlist: IWishlist;
    onUpdate: { (wishlist: IWishlist): void };
    onDelete: { (wishlist: IWishlist): void };
  }) => {
    return (
      <div className="text-center lg:text-left flex gap-4">
        <span>
          <div className="flex flex-row gap-2 justify-center lg:justify-start">
            <span className={"text-2xl"}>{wishlist.name}</span>
            <span>
              <VisibleStatus visible={wishlist.visible} />
            </span>
          </div>

          <p className={"text-default-500"}>{wishlist.description}</p>
        </span>
        <span className="my-auto">
          <WishlistItemMenu
            wishlist={wishlist}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </span>
      </div>
    );
  }
);

const Wishes = observer(({ wishlistUUID }: { wishlistUUID: string }) => {
  const router = useRouter();
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

  async function onDeleteWishlist(wishlist: IWishlist) {
    await deleteWishlist(wishlist.uuid);
    toast.success("Вишлист удален");
    router.push("/");
  }

  async function onUpdateWishlist(wishlist: IWishlist) {
    const updatedWishlist = await updateWishlist(wishlist);
    setWishlist(updatedWishlist);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      <div className="col-span-full">
        <WishlistDetail
          wishlist={wishlist}
          onUpdate={onUpdateWishlist}
          onDelete={onDeleteWishlist}
        />
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
