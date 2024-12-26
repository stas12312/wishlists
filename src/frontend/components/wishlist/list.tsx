"use client";

import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { useDisclosure } from "@nextui-org/modal";
import { use, useEffect, useState } from "react";

import { WishlistItem, WishlistsSkeletonItem } from "./card";
import WishlistSaveModal from "./saveModal";

import { IWishlist } from "@/lib/models";
import { getWishlists } from "@/lib/requests";
import toast from "react-hot-toast";
import AddCardButton from "../AddCardButton";

import WishlistFilter from "../filter";
import { observer } from "mobx-react-lite";
import userStore from "@/store/userStore";

export interface IWishlistFilter {
  showArchive: boolean;
  userId: number;
}

export const Wishlists = observer(() => {
  const [items, setItems] = useState<IWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {}, []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filter, setFilter] = useState<IWishlistFilter>({
    showArchive: false,
    userId: userStore.user.id,
  });

  useEffect(() => {
    setIsLoading(true);

    async function fetchWishlists() {
      await userStore.fetchMe();
      filter.userId = userStore.user.id;
      const res = await getWishlists(filter);

      setItems(res);
      setIsLoading(false);
    }

    fetchWishlists();
  }, [filter]);

  function onDelete(wishlist: IWishlist) {
    setItems(
      items.filter((value) => {
        return value.uuid != wishlist.uuid;
      })
    );
    toast.success(`Вишлист ${wishlist.is_active ? "архивирован" : "удален"}`);
  }

  function onRestore(wishlist: IWishlist) {
    setItems(
      items.filter((value) => {
        return value.uuid != wishlist.uuid;
      })
    );
  }

  function OnCreateWishlist(wishlist: IWishlist) {
    items.unshift(wishlist);
    onOpenChange();
  }

  let components = [];
  if (isLoading) {
    components = [];
    for (let i = 1; i < 10; i++) {
      components.push(<div key={i}>{<WishlistsSkeletonItem />}</div>);
    }
  } else {
    components = items.map((wishlist: IWishlist) => (
      <span key={wishlist.uuid}>
        <WishlistItem
          wishlist={wishlist}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      </span>
    ));
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <h1 className="text-2xl col-span-full text-center lg:text-left">
        Мои вишлисты
      </h1>
      <Divider className="my-4 col-span-full" />
      <span className="flex col-span-full">
        <WishlistFilter filter={filter} setFilter={setFilter} />
      </span>
      <div className="col-span-full">
        <WishlistSaveModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onSaveWishlist={OnCreateWishlist}
        />
      </div>
      {components.length ? (
        <>
          {!filter.showArchive ? <AddCardButton onPress={onOpen} /> : null}
          {components}
        </>
      ) : (
        <div className="col-span-full text-center">
          <h1 className="text-4xl	col-span-full">У вас нет списков</h1>
          <Button color="primary" variant="light" onPress={onOpen}>
            Добавить
          </Button>
        </div>
      )}
    </div>
  );
});
