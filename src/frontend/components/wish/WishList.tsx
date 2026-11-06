"use client";
import { Alert, Button, Skeleton, toast, useOverlayState } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdOutlineAdd } from "react-icons/md";
import useWebSocket from "react-use-websocket";

import { AnimatedList } from "../animated-list/AnimatedList";
import { LoginButton } from "../auth/Login";
import PageHeader from "../PageHeader";
import { PageSpinner } from "../PageSpinner";
import {
  DEFAULT_WISHLIST_EMOJI,
  getWishlistAccent,
} from "../wishlist/wishlistAppearance";
import { WishlistDetail } from "../wishlist/WishlistDetail";

import { WishItem } from "./WishCard";
import { IWishFilter, WishFilter } from "./WishFilter";
import WishSaveModal from "./WishSaveModal";
import { ISorting, SortingSelector } from "./WishSortingSelector";

import { getWishes } from "@/lib/client-requests/wish";
import { deleteWishlist, getWishlist } from "@/lib/client-requests/wishlist";
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

  const visibleItems = useMemo(() => {
    const filtered = filterWishes(items, filters);
    return sortWishes(filtered, sorting);
  }, [items, filters, sorting]);

  const statistic = useMemo(() => {
    return calcStatistic(items);
  }, [items]);

  useEffect(() => {
    async function fetchWishlists() {
      // Дожидаемся загрузки пользователя, чтобы кнопки шапки с isEditable
      // не появлялись отдельной вспышкой после отрисовки вишлиста
      const userPromise = userStore.getMe().catch(() => null);
      const response = await Promise.all([
        getWishes(wishlistUUID),
        getWishlist(wishlistUUID),
        userPromise,
      ]);
      if ("message" in response[1]) {
        setError(response[1]);
      } else {
        const responseWishes = response[0];
        setItems(responseWishes);
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
    setWishlist(wishlist);
    setItems(await getWishes(wishlist.uuid));
  }

  function onUpdate(wish: IWish) {
    const newWishes = [...items];
    const index = newWishes.findIndex((i) => i.uuid == wish.uuid);
    newWishes[index] = wish;
    setItems(newWishes);
  }

  const canAddWish = isEditable && wishlist.is_active;

  const accentClass = wishlist.uuid
    ? getWishlistAccent(wishlist.uuid, wishlist.settings?.color)
    : undefined;

  if (error?.message) {
    return (
      <div className="flex justify-center">
        <span className="text-large font-bold">{error.message}</span>
      </div>
    );
  }

  return (
    <div
      className={`${accentClass ?? ""} flex min-h-[calc(100dvh-11rem)] flex-col`}
    >
      {isLoading ? (
        <PageHeader>
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-3 md:gap-y-2">
            <div className="min-w-0 flex justify-center md:justify-start">
              <Skeleton className="h-8 w-3/5 md:w-2/5 rounded-full" />
            </div>
            <div className="flex items-center justify-center gap-2 md:col-start-2 md:row-start-1 md:row-span-2 md:self-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
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
        <div className="relative isolate flex flex-1 flex-col">
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
                      Войдите, чтобы видеть занятые подарки и бронировать
                    </Alert.Description>
                  </Alert.Content>
                  <LoginButton className="ml-4 my-auto" />
                </Alert>
              </div>
            </div>
          ) : null}
          {isEditable && !wishlist.settings?.for_other ? (
            <p className="col-span-full mb-4 text-sm text-muted">
              Бронирования скрыты от вас, чтобы сохранить сюрприз
            </p>
          ) : null}
          {items.length ? (
            <div className="col-span-full flex flex-wrap items-center gap-4 mb-4">
              {items.length ? (
                <>
                  <WishFilter
                    hidedFilters={
                      isEditable || !userStore.user.id
                        ? ["reserved"]
                        : undefined
                    }
                    initValues={{
                      priceFrom: priceInfo.minPrice,
                      priceTo: priceInfo.maxPrice,
                      fullfiled: "all",
                      reserved: "all",
                      currency: items[0].currency ?? "RUB",
                    }}
                    overlayClassName={`${accentClass} wishlist-overlay`}
                    onChangeFilter={(newFilter: IWishFilter) => {
                      if (!isEqual(newFilter, filters)) setFilters(newFilter);
                    }}
                  />
                  <SortingSelector
                    defaultField="created_at"
                    overlayClassName={`${accentClass} wishlist-overlay`}
                    onChangeSorting={setSorting}
                  />
                </>
              ) : null}
              {canAddWish ? (
                <Button className="w-full md:ml-auto md:w-auto" onPress={open}>
                  <MdOutlineAdd className="text-lg" />
                  Добавить желание
                </Button>
              ) : null}
            </div>
          ) : null}
          {!items.length ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-default px-4 py-8 text-center sm:px-5 sm:py-14 md:py-20">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent-soft sm:mb-6 sm:size-24 sm:rounded-3xl">
                <span aria-hidden="true" className="text-4xl sm:text-5xl">
                  {wishlist.settings?.emoji || DEFAULT_WISHLIST_EMOJI}
                </span>
              </div>
              <h2 className="text-lg font-semibold sm:text-xl md:text-2xl">
                Здесь пока нет желаний
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted md:text-base">
                {canAddWish
                  ? "Добавьте первое желание — пусть близкие знают, чем вас порадовать."
                  : "Владелец ещё не добавил желания. Загляните сюда позже."}
              </p>
              {canAddWish ? (
                <Button
                  className="mt-5 w-full sm:mt-6 sm:w-auto"
                  onPress={open}
                >
                  <MdOutlineAdd className="text-lg" />
                  Добавить желание
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className={`relative ${items.length ? "flex-1" : ""}`}>
            <AnimatedList
              className="relative"
              items={visibleItems.map((wish: IWish) => (
                <WishItem
                  key={wish.uuid}
                  wish={wish}
                  wishlist={wishlist}
                  onDelete={onDeleteWish}
                  onUpdate={onUpdate}
                />
              ))}
            />
          </div>

          <WishSaveModal
            className={accentClass}
            isOpen={isOpen}
            wishlistUUID={wishlistUUID}
            onOpenChange={toggle}
            onUpdate={onCreateWish}
          />
        </div>
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
