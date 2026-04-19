"use client";
import { Alert, Skeleton, toast, useOverlayState } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import useWebSocket from "react-use-websocket";

import AddCardButton from "../AddCardButton";
import { AnimatedList } from "../animated-list/AnimatedList";
import { LoginButton } from "../auth/Login";
import PageHeader from "../PageHeader";
import { PageSpinner } from "../PageSpinner";
import { WishlistDetail } from "../wishlist/WishlistDetail";

import { WishItem } from "./WishCard";
import { IWishFilter, WishFilter } from "./WishFilter";
import WishSaveModal from "./WishSaveModal";
import { ISorting, SortingSelector } from "./WishSortingSelector";

import { getWishes } from "@/lib/client-requests/wish";
import {
  deleteWishlist,
  getWishlist,
  updateWishlist,
} from "@/lib/client-requests/wishlist";
import { isEqual } from "@/lib/compare";
import { IError } from "@/lib/models";
import { IWish } from "@/lib/models/wish";
import { IWishlist } from "@/lib/models/wishlist";
import { defaultParams, getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";
import userStore from "@/store/userStore";

interface IPriceInfo {
  minPrice: number;
  maxPrice: number;
}

export interface IStatistic {
  totalSum: number;
  fullfiledCount: number;
  totalCount: number;
}

const Wishes = observer(({ wishlistUUID }: { wishlistUUID: string }) => {
  const router = useRouter();
  const [items, setItems] = useState<IWish[]>([]);
  const [visibleItems, setVisibleItems] = useState<IWish[]>([]);
  const [statistic, setStatistic] = useState<IStatistic>({} as IStatistic);

  const priceInfo = useMemo<IPriceInfo>(() => {
    return items.reduce<IPriceInfo>(
      (acc, item) => ({
        minPrice: Math.min(acc.minPrice, item.cost ?? 0),
        maxPrice: Math.max(acc.maxPrice, item.cost ?? 0),
      }),
      {
        minPrice: Infinity,
        maxPrice: -Infinity,
      },
    );
  }, [items]);

  const [sorting, setSorting] = useState<ISorting>({
    field: "created_at",
    desc: true,
  });

  const [filters, setFilters] = useState<IWishFilter>({
    fullfiled: "all",
    reserved: "all",
    priceFrom: -Infinity,
    priceTo: Infinity,
  });

  const [wishlist, setWishlist] = useState<IWishlist>({} as IWishlist);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState({} as IError);
  const isEditable = userStore.user.id == wishlist.user_id;

  const { isOpen, open, toggle } = useOverlayState();

  const { lastJsonMessage, sendJsonMessage } = useWebSocket(getWebsocketUrl, {
    filter: (message) => {
      return isEvent(message, WSEvent.Update, getChannelName(wishlistUUID));
    },
    ...defaultParams,
  });

  useEffect(() => {
    startTransition(() => {
      const filteredWishes = filterWishes(items, filters);
      const sortedWishes = sortWishes(filteredWishes, sorting);
      setVisibleItems(sortedWishes);
    });

    setStatistic(calcStatistic(items));
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
        const responseWishes = response[0];
        setItems(responseWishes);
        setVisibleItems(responseWishes);
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
    if (lastJsonMessage === null) {
      return;
    }
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
    toast(message);
  }

  async function onCreateWish(wish: IWish) {
    toggle();
    setItems([wish, ...items]);
  }

  async function onDeleteWishlist(wishlist: IWishlist) {
    await deleteWishlist(wishlist.uuid);
    toast("Вишлист удален");
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

  return (
    <>
      {isLoading ? (
        <PageHeader>
          <div className="flex justify-center md:justify-start">
            <Skeleton className="h-8 w-1/5 rounded-full" />
          </div>
          <div className="flex justify-center md:justify-start">
            <Skeleton className="h-5 w-2/5 mt-2 rounded-full" />
          </div>
        </PageHeader>
      ) : (
        <WishlistDetail
          isEditable={isEditable}
          statistic={statistic}
          wishlist={wishlist}
          onDelete={onDeleteWishlist}
          onUpdate={onUpdateWishlist}
        />
      )}
      {isLoading ? (
        <div className="col-span-full">
          <PageSpinner />
        </div>
      ) : (
        <>
          {!userStore.user.id ? (
            <div className="col-span-full flex justify-center mb-4">
              <div>
                <Alert className="mx-auto" status="warning">
                  <Alert.Indicator />
                  <Alert.Content color="warning">
                    <Alert.Title>
                      Некоторые из желаний могут быть забронированы
                    </Alert.Title>
                    <Alert.Description>
                      Для отображения забронированных желаний войдите в свой
                      аккаунт
                    </Alert.Description>
                  </Alert.Content>
                  <LoginButton className="ml-4 my-auto" />
                </Alert>
              </div>
            </div>
          ) : null}
          {items.length ? (
            <div className="col-span-full flex gap-4 mb-4">
              <WishFilter
                hidedFilters={
                  isEditable || !userStore.user.id ? ["reserved"] : undefined
                }
                initValues={{
                  priceFrom: priceInfo.minPrice,
                  priceTo: priceInfo.maxPrice,
                  fullfiled: "all",
                  reserved: "all",
                  currency: items[0].currency ?? "RUB",
                }}
                onChangeFilter={(newFilter: IWishFilter) => {
                  if (!isEqual(newFilter, filters)) setFilters(newFilter);
                }}
              />
              <SortingSelector
                defaultField="created_at"
                onChangeSorting={setSorting}
              />
            </div>
          ) : null}
          <AnimatedList
            items={[
              isEditable && wishlist.is_active ? (
                <AddCardButton
                  key="add-button"
                  className="h-40 md:h-70 w-full"
                  title="Добавить желание"
                  onPress={open}
                />
              ) : null,
              ...visibleItems.map((wish: IWish) => (
                <WishItem
                  key={wish.uuid}
                  wish={wish}
                  onDelete={onDeleteWish}
                  onUpdate={onUpdate}
                />
              )),
            ]}
          />

          <WishSaveModal
            isOpen={isOpen}
            wishlistUUID={wishlistUUID}
            onOpenChange={toggle}
            onUpdate={onCreateWish}
          />
        </>
      )}
    </>
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
      isFilterByReserved(filters.reserved, item) &&
      (item.cost ?? 0) >= filters.priceFrom &&
      (item.cost ?? 0) <= filters.priceTo
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

function calcStatistic(wishes: IWish[]): IStatistic {
  const statistic = {
    totalSum: 0,
    fullfiledCount: 0,
    totalCount: 0,
  };

  for (const wish of wishes) {
    if (wish.fulfilled_at) {
      statistic.fullfiledCount += 1;
    }
    if (wish.cost) {
      statistic.totalSum += wish.cost;
    }
    statistic.totalCount += 1;
  }
  return statistic;
}

function getChannelName(wishlistUUID: string): string {
  return `wishlist_${wishlistUUID}`;
}
