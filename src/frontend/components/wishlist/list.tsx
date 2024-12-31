"use client";

import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { useDisclosure } from "@nextui-org/modal";
import { createRef, useEffect, useRef, useState } from "react";

import { WishlistItem, WishlistsSkeletonItem } from "./card";
import WishlistSaveModal from "./saveModal";

import { Cursor, IWishlist } from "@/lib/models";
import { getWishlists } from "@/lib/requests";
import toast from "react-hot-toast";
import AddCardButton from "../AddCardButton";

import userStore from "@/store/userStore";
import { observer } from "mobx-react-lite";
import WishlistFilter from "../filter";

export interface IWishlistFilter {
  showArchive: boolean;
  userId: number;
}

export const Wishlists = observer(() => {
  const [items, setItems] = useState<IWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastItem = createRef<HTMLDivElement>();
  const observerLoader = useRef<IntersectionObserver | null>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<IWishlistFilter>({
    showArchive: false,
    userId: userStore.user.id,
  });
  const [cursor, setCursor] = useState(["", ""]);

  useEffect(() => {
    setIsLoading(true);
    if (userStore.isLoading) {
      return;
    }
    console.log("Изменился фильтр", filter);
    if (filter.userId == 0) {
      userStore.fetchMe();
      setFilter({ ...filter, userId: userStore.user.id });
      return;
    }
    async function fetchData() {
      const cursor = ["", ""];
      setCursor(cursor);
      await fetchWishlists(true, filter, cursor);
      setIsLoading(false);
    }
    fetchData();
  }, [filter, userStore.isLoading]);

  function onDelete(wishlist: IWishlist) {
    setItems(
      items.filter((value) => {
        return value.uuid != wishlist.uuid;
      })
    );
    toast.success(`Вишлист ${wishlist.is_active ? "архивирован" : "удален"}`);
  }

  async function fetchWishlists(
    firstRequest: boolean = false,
    filter: IWishlistFilter,
    cursor: Cursor
  ) {
    const result = await getWishlists(filter, {
      cursor: cursor,
      count: 30,
    });
    let newItems = result.data;
    if (!firstRequest) {
      newItems = items.concat(newItems);
    }
    setItems(newItems);
    setCursor(result.navigation.cursor);
    setHasMore(result.data.length !== 0);
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
    components = items.map((wishlist: IWishlist, index: number) => (
      <span key={wishlist.uuid}>
        <WishlistItem
          wishlist={wishlist}
          onDelete={onDelete}
          onRestore={onRestore}
          ref={index + 1 == items.length ? lastItem : null}
        />
      </span>
    ));
  }

  const actionInSight = (entries: any[]) => {
    if (entries[0].isIntersecting && hasMore) {
      fetchWishlists(false, filter, cursor);
    }
  };

  useEffect(() => {
    if (observerLoader.current) {
      observerLoader.current.disconnect();
    }

    observerLoader.current = new IntersectionObserver(actionInSight);

    if (lastItem.current) {
      observerLoader.current.observe(lastItem.current);
    }
  }, [lastItem]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <h1 className="text-2xl col-span-full text-center lg:text-left">
        Мои вишлисты
      </h1>
      <Divider className="col-span-full" />
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
