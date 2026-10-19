"use client";

import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from "next/navigation";
import { Button, toast, useOverlayState } from "@heroui/react";

import AddCardButton from "../AddCardButton";
import { AnimatedList } from "../animated-list/AnimatedList";
import { InfinityLoader } from "../InfinityLoader";
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
    const cursorRef = useRef<Cursor>(["", ""]);
    // Номер последнего запроса: ответы на устаревшие запросы
    // (например, после смены фильтра) отбрасываются
    const requestIdRef = useRef(0);

    const { isOpen, open, toggle } = useOverlayState();
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState<IWishlistFilter>({
      showArchive: false,
      userId: userId,
      username: username,
    });
    const router = useRouter();
    useEffect(() => {
      setIsLoading(true);
      setHasMore(false);
      setItems([]);
      async function fetchData() {
        if (await fetchWishlists(true)) {
          setIsLoading(false);
        }
      }
      fetchData();
    }, [filter, userStore.isLoading]);

    async function onDelete(wishlist: IWishlist) {
      await deleteWishlist(wishlist.uuid);
      setItems((prev) => prev.filter((value) => value.uuid != wishlist.uuid));
      toast(`Вишлист ${wishlist.is_active ? "архивирован" : "удален"}`);
    }

    // Возвращает false, если ответ устарел и был отброшен
    async function fetchWishlists(firstRequest: boolean): Promise<boolean> {
      if (firstRequest) {
        cursorRef.current = ["", ""];
      }
      const requestId = ++requestIdRef.current;
      const result = await getWishlists(filter, {
        cursor: cursorRef.current,
        count: COUNT,
      });
      if (requestId !== requestIdRef.current) {
        return false;
      }
      cursorRef.current = result.navigation.cursor;
      setItems((prev) =>
        firstRequest ? result.data : prev.concat(result.data),
      );
      setHasMore(result.data.length === COUNT);
      return true;
    }

    function onRestore(wishlist: IWishlist) {
      setItems((prev) => prev.filter((value) => value.uuid != wishlist.uuid));
    }

    function OnCreateWishlist(wishlist: IWishlist) {
      setItems((prev) => [wishlist, ...prev]);
      router.push(`/wishlists/${wishlist.uuid}`);
      toggle();
    }

    let components = items.map((wishlist: IWishlist) => (
      <WishlistItem
        key={`${wishlist.uuid}-${wishlist.is_active}`}
        edit={actions.edit}
        wishlist={wishlist}
        onDelete={onDelete}
        onRestore={onRestore}
      />
    ));

    return (
      <>
        {actions.filter ? (
          <span className="flex col-span-full mb-4">
            <WishlistFilter filter={filter} setFilter={setFilter} />
          </span>
        ) : null}
        {isLoading ? <PageSpinner /> : null}

        {components.length ? (
          <InfinityLoader
            hasMore={hasMore && !isLoading}
            sentinelClassName="col-span-full"
            onLoad={() => fetchWishlists(false)}
          >
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
          </InfinityLoader>
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
