"use client";

import { IWishlist } from "@/lib/models";
import { getWishlists } from "@/lib/requests";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { useDisclosure } from "@nextui-org/modal";
import { Skeleton } from "@nextui-org/skeleton";
import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import { WishlistItem, WishlistsSkeletonItem } from "./card";
import WishlistSaveModal from "./saveModal";

export function Wishlists() {
  const [items, setItems] = useState<IWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlists() {
      const res = await getWishlists();
      setItems(res);
      setIsLoading(false);
    }

    fetchWishlists();
  }, []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function onDelete(wishlist: IWishlist) {
    setItems(
      items.filter((value) => {
        return value.uuid != wishlist.uuid;
      })
    );
  }

  if (isLoading) {
    const components = [];
    for (let i = 1; i < 10; i++) {
      components.push(<div key={i}>{<WishlistsSkeletonItem />}</div>);
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <h1 className="text-2xl col-span-full">Мои вишлисты</h1>
        <Divider className="my-4 col-span-full" />
        <Skeleton className="rounded-lg col-span-full">
          <Button fullWidth></Button>
        </Skeleton>
        {components}
      </div>
    );
  }

  function OnCreateWishlist(wishlist: IWishlist) {
    items.unshift(wishlist);
    onOpenChange();
  }

  const components = items.map((wishlist: IWishlist) => (
    <span key={wishlist.uuid}>
      <WishlistItem wishlist={wishlist} onDelete={onDelete} />
    </span>
  ));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <h1 className="text-2xl col-span-full">Мои вишлисты</h1>
      <Divider className="my-4 col-span-full" />
      <div className="col-span-full">
        <Button
          onPress={onOpen}
          fullWidth
          startContent={<MdAdd />}
          color="primary"
        >
          Добавить
        </Button>
        <WishlistSaveModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onSaveWishlist={OnCreateWishlist}
        />
      </div>

      {components.length ? (
        components
      ) : (
        <div className="col-span-12 text-center">
          <h1 className="text-4xl	">У вас нет списоков</h1>
        </div>
      )}
    </div>
  );
}
