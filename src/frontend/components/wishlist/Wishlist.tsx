"use client";

import { observer } from "mobx-react-lite";
import { createRef, useEffect, useRef, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from "next/navigation";
import { Button, toast, useOverlayState } from "@heroui/react";

import AddCardButton from "../AddCardButton";
import { AnimatedList } from "../animated-list/AnimatedList";
import { PageSpinner } from "../PageSpinner";

import { WishlistItem } from "./WishlistCard";
import WishlistSaveModal from "./WishlistSaveModal";
import WishlistFilter from "./WishlistFilter";

import { Cursor } from "@/lib/models";
import { IWishlist, IWishlistAction } from "@/lib/models/wishlist";
import { getWishlists } from "@/lib/client-requests/wishlist";
import { deleteWishlist } from "@/lib/client-requests/wishlist";
import userStore from "@/store/userStore";

export interface IWishlistFilter {
  showArchive: boolean;
  userId?: number;
  username?: string;
}

const COUNT = 30;

export const Wishlists = observer(
  ({
    actions,
    userId,
    username,
  }: {
    actions: IWishlistAction;
    userId?: number;
    username?: string;
  }) => {
    const [items, setItems] = useState<IWishlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const lastItem = createRef<HTMLDivElement>();
    const observerLoader = useRef<IntersectionObserver | null>(null);

    const { isOpen, open, toggle } = useOverlayState();
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState<IWishlistFilter>({
      showArchive: false,
      userId: userId,
      username: username,
    });
    const [cursor, setCursor] = useState(["", ""]);
    const router = useRouter();
    useEffect(() => {
      setIsLoading(true);
      async function fetchData() {
        const cursor = ["", ""];
        setItems([]);
        setCursor(cursor);
        await fetchWishlists(true, filter, cursor);
        setIsLoading(false);
      }
      fetchData();
    }, [filter, userStore.isLoading]);

    async function onDelete(wishlist: IWishlist) {
      await deleteWishlist(wishlist.uuid);
      setItems(
        items.filter((value) => {
          return value.uuid != wishlist.uuid;
        }),
      );
      toast(`Вишлист ${wishlist.is_active ? "архивирован" : "удален"}`);
    }

    async function fetchWishlists(
      firstRequest: boolean = false,
      filter: IWishlistFilter,
      cursor: Cursor,
    ) {
      const result = await getWishlists(filter, {
        cursor: cursor,
        count: COUNT,
      });
      let newItems = result.data;
      if (!firstRequest) {
        newItems = items.concat(newItems);
      }
      setItems(newItems);
      setCursor(result.navigation.cursor);
      setHasMore(result.data.length === COUNT);
    }

    function onRestore(wishlist: IWishlist) {
      setItems(
        items.filter((value) => {
          return value.uuid != wishlist.uuid;
        }),
      );
    }

    function OnCreateWishlist(wishlist: IWishlist) {
      items.unshift(wishlist);
      router.push(`/wishlists/${wishlist.uuid}`);
      toggle();
    }

    let components = items.map((wishlist: IWishlist, index: number) => (
      <WishlistItem
        key={`${wishlist.uuid}-${wishlist.is_active}`}
        ref={index + 1 == items.length ? lastItem : null}
        edit={actions.edit}
        wishlist={wishlist}
        onDelete={onDelete}
        onRestore={onRestore}
      />
    ));

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
      <>
        {actions.filter ? (
          <span className="flex col-span-full mb-4">
            <WishlistFilter filter={filter} setFilter={setFilter} />
          </span>
        ) : null}
        {isLoading ? <PageSpinner /> : null}

        {components.length ? (
          <AnimatedList
            items={[
              !filter.showArchive && actions.edit && !isLoading ? (
                <AddCardButton
                  className="h-40 w-full"
                  title="Добавить вишлист"
                  onPress={open}
                />
              ) : null,
              ...components,
            ]}
          />
        ) : isLoading ? null : (
          <div className="col-span-full text-center">
            <h1 className="text-4xl	col-span-full">
              {filter.showArchive
                ? "Список архивированных вишлистов пуст"
                : "Список вишлистов пуст"}
            </h1>
            {actions.edit && !filter.showArchive ? (
              <Button variant="primary" onPress={open}>
                <IoMdAdd />
                Добавить
              </Button>
            ) : null}
          </div>
        )}
        <WishlistSaveModal
          isOpen={isOpen}
          onOpenChange={toggle}
          onSaveWishlist={OnCreateWishlist}
        />
      </>
    );
  },
);
