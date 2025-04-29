"use client";
import { Alert } from "@heroui/alert";
import { Chip } from "@heroui/chip";
import { useDisclosure } from "@heroui/modal";
import { Skeleton } from "@heroui/skeleton";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addToast } from "@heroui/toast";
import useWebSocket from "react-use-websocket";

import AddCardButton from "../addCardButton";
import PageHeader from "../pageHeader";
import { PageSpinner } from "../pageSpinner";
import { VisibleStatus } from "../visibleIcon";
import { WishItem } from "../wish/card";
import WishSaveModal from "../wish/saveModal";
import { LoginButton } from "../login";
import UserCard from "../user/card";
import { ISorting, SortingSelector } from "../wish/sortingSelector";
import { IWishFilter, WishFilter } from "../wish/filter";

import WishlistItemMenu from "./menu";

import { IError } from "@/lib/models";
import { IWish } from "@/lib/models/wish";
import { IWishlist } from "@/lib/models/wishlist";
import { deleteWishlist, getWishlist, updateWishlist } from "@/lib/requests";
import { getWishes } from "@/lib/requests/wish";
import userStore from "@/store/userStore";
import { defaultParams, getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";

function getChannelName(wishlistUUID: string): string {
  return `wishlist_${wishlistUUID}`;
}

const WishlistDetail = observer(
  ({
    wishlist,
    onUpdate,
    onDelete,
    isEditable,
  }: {
    wishlist: IWishlist;
    onUpdate: { (wishlist: IWishlist): void };
    onDelete: { (wishlist: IWishlist): Promise<void> };
    isEditable: boolean;
  }) => {
    const user = wishlist.user;
    return (
      <div className="flex flex-col">
        {user && user.id != userStore.user.id ? (
          <UserCard isShowProfileLink username={user.username} />
        ) : null}
        <PageHeader>
          <div className="flex justify-center md:justify-start">
            <span>
              <div className="flex flex-row gap-2 justify-center lg:justify-start">
                <span className="text-2xl" title={wishlist.name}>
                  {wishlist.name}
                </span>
                <span>
                  <VisibleStatus visible={wishlist.visible} />
                </span>
              </div>
            </span>
            <span className="my-auto">
              <WishlistItemMenu
                isEditable={isEditable}
                wishlist={wishlist}
                onDelete={onDelete}
                onRestore={() => {}}
                onUpdate={onUpdate}
              />
            </span>
          </div>
          <div className="text-small text-default-500 flex gap-2 justify-center md:justify-start">
            {wishlist.date ? (
              <Chip>{new Date(wishlist.date).toLocaleDateString()}</Chip>
            ) : null}
            <span className="my-auto" title={wishlist.description}>
              {wishlist.description}
            </span>
          </div>
        </PageHeader>
      </div>
    );
  },
);

const Wishes = observer(({ wishlistUUID }: { wishlistUUID: string }) => {
  const router = useRouter();
  const [items, setItems] = useState<IWish[]>([]);
  const [visibleItems, setVisibleItems] = useState<IWish[]>([]);
  const [sorting, setSorting] = useState<ISorting>({
    field: "created_at",
    desc: true,
  });
  const [filters, setFilters] = useState<IWishFilter>({
    fullfiled: "all",
    reserved: "all",
  });
  const [wishlist, setWishlist] = useState<IWishlist>({} as IWishlist);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState({} as IError);
  const isEditable = userStore.user.id == wishlist.user_id;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { lastJsonMessage, sendJsonMessage } = useWebSocket(getWebsocketUrl, {
    filter: (message) => {
      return isEvent(message, WSEvent.Update, getChannelName(wishlistUUID));
    },
    ...defaultParams,
  });

  useEffect(() => {
    if (!items) {
      return;
    }
    const filteredWishes = filterWishes(items, filters);
    const sortedWishes = sortWishes(filteredWishes, sorting);

    setVisibleItems(sortedWishes);
  }, [items, sorting, filters]);

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
        setVisibleItems(response[0]);
        setWishlist(response[1]);
        setIsLoading(false);
        sendJsonMessage({
          event: WSEvent.Subscribe,
          channel: getChannelName(wishlistUUID),
        });
      }
    }
    fetchWishlists();

    return () => {
      sendJsonMessage({
        event: WSEvent.Unsubscribe,
        channel: getChannelName(wishlistUUID),
      });
    };
  }, []);

  useEffect(() => {
    async function fetchWishes() {
      const wishes = await getWishes(wishlistUUID);
      setItems(wishes);
    }
    fetchWishes();
  }, [lastJsonMessage]);

  function onDeleteWish(wish: IWish, message: string) {
    setItems(
      items.filter((value) => {
        return value.uuid !== wish.uuid;
      }),
    );
    addToast({
      title: message,
    });
  }

  async function onCreateWish(wish: IWish) {
    onOpenChange();
    items.unshift(wish);
  }

  async function onDeleteWishlist(wishlist: IWishlist) {
    await deleteWishlist(wishlist.uuid);
    addToast({
      title: "Вишлист удален",
    });
    router.push("/");
  }

  async function onUpdateWishlist(wishlist: IWishlist) {
    const updatedWishlist = await updateWishlist(wishlist);
    setWishlist(updatedWishlist);
  }

  function onUpdate(wish: IWish) {
    const newWishes = [...items];
    const index = newWishes.findIndex((i) => i.uuid == wish.uuid);
    newWishes[index] = wish;
    setItems(newWishes);
  }

  if (error?.message) {
    return (
      <div className="flex justify-center">
        <span className="text-large font-bold">{error.message}</span>
      </div>
    );
  }
  const components = visibleItems.map((wish: IWish) => (
    <div key={wish.uuid}>
      <WishItem wish={wish} onDelete={onDeleteWish} onUpdate={onUpdate} />
    </div>
  ));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      <div className="col-span-full">
        {isLoading ? (
          <PageHeader>
            <div className="flex justify-center md:justify-start">
              <Skeleton className="h-[32px] w-1/5 rounded-full" />
            </div>
            <div className="flex justify-center md:justify-start">
              <Skeleton className="h-[20px] w-2/5 mt-[8px] rounded-full" />
            </div>
          </PageHeader>
        ) : (
          <WishlistDetail
            isEditable={isEditable}
            wishlist={wishlist}
            onDelete={onDeleteWishlist}
            onUpdate={onUpdateWishlist}
          />
        )}
      </div>
      {isLoading ? (
        <div className="col-span-full">
          <PageSpinner />
        </div>
      ) : (
        <>
          {!userStore.user.id ? (
            <div className="col-span-full flex justify-center">
              <div>
                <Alert
                  hideIconWrapper
                  className="mx-auto"
                  color="warning"
                  description="Для отображения забронированных желаний войдите в свой аккаунт"
                  endContent={<LoginButton className="ml-4" />}
                  title="Некоторые из желаний могут быть забронированы"
                />
              </div>
            </div>
          ) : null}
          <div className="col-span-full flex gap-4">
            <WishFilter
              hidedFilters={
                isEditable || !userStore.user.id ? ["reserved"] : undefined
              }
              onChangeFilter={setFilters}
            />
            <SortingSelector
              defaultField="created_at"
              onChangeSorting={setSorting}
            />
          </div>

          <WishSaveModal
            isOpen={isOpen}
            wishlistUUID={wishlistUUID}
            onOpenChange={onOpenChange}
            onUpdate={onCreateWish}
          />
          {isEditable ? (
            <AddCardButton
              className="md:h-[300px]"
              title="Добавить желание"
              onPress={onOpen}
            />
          ) : null}
          {components}
        </>
      )}
    </div>
  );
});

export default Wishes;

function sortWishes(items: IWish[], sorting: ISorting): IWish[] {
  return [
    ...items.sort((a, b) => {
      const aProp = a[sorting.field as keyof IWish];
      const bProp = b[sorting.field as keyof IWish];
      if (aProp === undefined || bProp === undefined) return 0;
      if (!sorting.desc) {
        return aProp < bProp ? -1 : bProp < aProp ? 1 : 0;
      }
      return aProp > bProp ? -1 : bProp > aProp ? 1 : 0;
    }),
  ];
}

function filterWishes(items: IWish[], filters: IWishFilter) {
  const result: IWish[] = [];
  for (let item of items) {
    if (
      isFilterByFullfiled(filters.fullfiled, item) &&
      isFilterByReserved(filters.reserved, item)
    ) {
      result.push(item);
    }
  }
  return result;
}

function isFilterByFullfiled(
  fullfiledFilter: "all" | "true" | "false",
  item: IWish,
) {
  return (
    fullfiledFilter === "all" ||
    (fullfiledFilter === "true" && item.fulfilled_at) ||
    (fullfiledFilter === "false" && !item.fulfilled_at)
  );
}

function isFilterByReserved(
  reservedFilter: "all" | "true" | "false",
  item: IWish,
) {
  return (
    reservedFilter === "all" ||
    (reservedFilter === "true" && !item.actions.reserve) ||
    (reservedFilter === "false" && item.actions.reserve)
  );
}
