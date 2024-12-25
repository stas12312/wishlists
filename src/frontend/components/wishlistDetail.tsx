"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { useDisclosure } from "@nextui-org/modal";
import { observer } from "mobx-react-lite";
import { use, useEffect, useState } from "react";

import { MdOutlineFilterAlt } from "react-icons/md";
import { VisibleStatus } from "./visibleIcon";
import { WishItem } from "./wish/card";
import WishSaveModal from "./wish/saveModal";

import { IError, IWish, IWishlist } from "@/lib/models";
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
import AddCardButton from "./AddCardButton";
import { Spinner } from "@nextui-org/spinner";
import { parseDate } from "@internationalized/date";
import { Chip } from "@nextui-org/chip";
import { Badge } from "@nextui-org/badge";

const WishlistDetail = observer(
  ({
    wishlist,
    onUpdate,
    onDelete,
    isEditable,
  }: {
    wishlist: IWishlist;
    onUpdate: { (wishlist: IWishlist): void };
    onDelete: { (wishlist: IWishlist): void };
    isEditable: boolean;
  }) => {
    return (
      <div className="flex flex-col">
        <div className="text-center lg:text-left flex gap-4">
          <span>
            <div className="flex flex-row gap-2 justify-center lg:justify-start">
              <span className={"text-2xl"}>{wishlist.name}</span>
              <span>
                <VisibleStatus visible={wishlist.visible} />
              </span>
            </div>
          </span>
          <span className="my-auto">
            <WishlistItemMenu
              isEditable={isEditable}
              wishlist={wishlist}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onRestore={() => {}}
            />
          </span>
        </div>
        <div className="text-small text-default-500 flex gap-2">
          {wishlist.date ? (
            <Chip>{new Date(wishlist.date).toLocaleDateString()}</Chip>
          ) : null}
          <span className="my-auto">{wishlist.description}</span>
        </div>
      </div>
    );
  }
);

const Wishes = observer(({ wishlistUUID }: { wishlistUUID: string }) => {
  const router = useRouter();
  const [items, setItems] = useState<IWish[]>([]);
  const [wishlist, setWishlist] = useState<IWishlist>({} as IWishlist);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState({} as IError);
  const isEditable = userStore.user.id == wishlist.user_id;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    async function fetchWishlists() {
      const response = await Promise.all([
        getWishes(wishlistUUID),
        getWishlist(wishlistUUID),
      ]);
      if ("message" in response[1]) {
        setError(response[1]);
      } else {
        setItems(response[0]);
        setWishlist(response[1]);
        setIsLoading(false);
      }
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

  if (error?.message) {
    return (
      <div className="flex justify-center">
        <span className="text-large font-bold">{error.message}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex my-auto justify-center mt-[40vh]">
        <Spinner></Spinner>
      </div>
    );
  }

  const components = items.map((wish: IWish) => (
    <div key={wish.uuid}>
      <WishItem wish={wish} onDelete={onDeleteWish} />
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
          isEditable={isEditable}
          wishlist={wishlist}
          onUpdate={onUpdateWishlist}
          onDelete={onDeleteWishlist}
        />
      </div>
      <Divider className="my-4 col-span-full" />

      <WishSaveModal
        isOpen={isOpen}
        wishlistUUID={wishlistUUID}
        onOpenChange={onOpenChange}
        onUpdate={onCreateWish}
      />
      {isEditable ? (
        <AddCardButton onPress={onOpen} className="md:h-[300px]" />
      ) : null}
      {components}
    </div>
  );
});

export default Wishes;
