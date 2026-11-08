"use client";

import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from "next/navigation";
import { Button, toast, useOverlayState } from "@heroui/react";

import { AnimatedList } from "../animated-list/AnimatedList";
import { InfinityLoader } from "../InfinityLoader";
import PageHeader from "../PageHeader";
import { PageSpinner } from "../PageSpinner";

import { WishlistItem } from "./WishlistCard";
import WishlistSaveModal from "./WishlistSaveModal";
import WishlistFilter from "./WishlistFilter";

import { Cursor } from "@/lib/models";
import { IWishlist, IWishlistAction } from "@/lib/models/wishlist";
import { getWishlists } from "@/lib/client-requests/wishlist";
import { deleteWishlist } from "@/lib/client-requests/wishlist";
import userStore from "@/store/userStore";
import { useRememberWishlists } from "@/providers/ProfileProvider";

export interface IWishlistFilter {
  showArchive: boolean;
  userId?: number;
  username?: string;
}

const COUNT = 30;

export const Wishlists = observer(
  ({
    title,
    actions,
    userId,
    username,
  }: {
    title: string;
    actions: IWishlistAction;
    userId?: number;
    username?: string;
  }) => {
    const [items, setItems] = useState<IWishlist[]>([]);
    const rememberWishlists = useRememberWishlists();
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
      rememberWishlists(result.data, { username });
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
      rememberWishlists([wishlist]);
      setItems((prev) => [wishlist, ...prev]);
      router.push(`/wishlists/${wishlist.uuid}`);
      toggle();
    }

    const components = items.map((wishlist: IWishlist) => (
      <WishlistItem
        key={`${wishlist.uuid}-${wishlist.is_active}`}
        edit={actions.edit}
        isOwner={wishlist.user_id === userStore.user.id}
        wishlist={wishlist}
        onDelete={onDelete}
        onRestore={onRestore}
      />
    ));

    const showAddButton =
      actions.edit && !filter.showArchive && (isLoading || items.length > 0);

    return (
      <>
        <PageHeader dividerClassName="mt-4 mb-5">
          <h1 className="text-center text-2xl font-normal sm:text-left">
            {title}
          </h1>
        </PageHeader>
        {actions.filter || showAddButton ? (
          <div className="col-span-full mb-5 flex items-center justify-between gap-4">
            {actions.filter ? (
              <WishlistFilter filter={filter} setFilter={setFilter} />
            ) : null}
            {showAddButton ? (
              <Button
                className="ml-auto shrink-0"
                variant="primary"
                onPress={open}
              >
                <IoMdAdd />
                Добавить вишлист
              </Button>
            ) : null}
          </div>
        ) : null}
        {isLoading ? <PageSpinner /> : null}

        {components.length ? (
          <InfinityLoader
            hasMore={hasMore && !isLoading}
            sentinelClassName="col-span-full"
            onLoad={() => fetchWishlists(false)}
          >
            <AnimatedList
              gridConfig="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              items={components}
            />
          </InfinityLoader>
        ) : isLoading ? null : !filter.showArchive ? (
          <div className="col-span-full flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-default px-5 py-14 text-center md:py-20">
            <div className="mb-6 flex size-24 items-center justify-center rounded-3xl bg-accent-soft">
              <span aria-hidden="true" className="text-5xl">
                🎁
              </span>
            </div>
            <h2 className="text-xl font-semibold md:text-2xl">
              Здесь пока нет вишлистов
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted md:text-base">
              {actions.edit
                ? "Создайте первый вишлист и соберите в нём всё, о чём мечтаете."
                : "Пользователь ещё не добавил вишлисты. Загляните сюда позже."}
            </p>
            {actions.edit ? (
              <Button className="mt-6 w-full sm:w-auto" onPress={open}>
                <IoMdAdd />
                Создать первый вишлист
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="col-span-full flex min-h-60 flex-col items-center justify-center gap-3 text-center">
            <h2 className="text-xl text-default-foreground/60">
              Список архивированных вишлистов пуст
            </h2>
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
