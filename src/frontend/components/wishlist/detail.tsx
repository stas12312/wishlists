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
import { motion } from "framer-motion";

import AddCardButton from "../addCardButton";
import PageHeader from "../pageHeader";
import { PageSpinner } from "../pageSpinner";
import { WishItem } from "../wish/card";
import WishSaveModal from "../wish/saveModal";
import { LoginButton } from "../login";
import UserCard from "../user/card";
import { ISorting, SortingSelector } from "../wish/sortingSelector";
import { IWishFilter, WishFilter } from "../wish/filter";
import { CardsList } from "../cardsList/cardsList";
import { CustomBreadcrumbs } from "../breadcrumbs";
import { VisibleChip } from "../visibleChip";

import WishlistItemMenu from "./menu";

import { IError } from "@/lib/models";
import { IWish } from "@/lib/models/wish";
import { IWishlist } from "@/lib/models/wishlist";
import { getWishlist } from "@/lib/client-requests/wishlist";
import { deleteWishlist } from "@/lib/client-requests/wishlist";
import { updateWishlist } from "@/lib/client-requests/wishlist";
import { getWishes } from "@/lib/client-requests/wish";
import userStore from "@/store/userStore";
import { defaultParams, getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";
import { isEqual } from "@/lib/compare";
function getChannelName(wishlistUUID: string): string {
  return `wishlist_${wishlistUUID}`;
}

interface IStatistic {
  totalSum: number;
  fullfiledCount: number;
  totalCount: number;
}

const WishlistDetail = observer(
  ({
    wishlist,
    onUpdate,
    onDelete,
    isEditable,
    statistic,
  }: {
    wishlist: IWishlist;
    onUpdate: { (wishlist: IWishlist): void };
    onDelete: { (wishlist: IWishlist): Promise<void> };
    isEditable: boolean;
    statistic?: IStatistic;
  }) => {
    const user = wishlist.user;
    return (
      <div className="flex flex-col">
        {user && user.id != userStore.user.id ? (
          <UserCard username={user.username} />
        ) : null}
        <PageHeader>
          <div className="flex justify-center md:justify-start">
            <span>
              <div className="flex flex-row gap-2 justify-center lg:justify-start">
                <CustomBreadcrumbs
                  items={[
                    {
                      title: isEditable ? "Вишлисты" : "Вишлисты пользователя",
                      href: isEditable
                        ? "/"
                        : `/users/${wishlist.user?.username}`,
                    },
                    {
                      title: wishlist.name,
                      href: `/wishlists/${wishlist.uuid}`,
                    },
                  ]}
                />
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

          <span
            className="flex justify-center md:justify-start text-small text-default-500"
            title={wishlist.description}
          >
            {wishlist.description}
          </span>
          <motion.div
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            className="flex gap-2 justify-center md:justify-start flex-wrap mt-2"
            initial={{ opacity: 0 }}
          >
            {user && user.id === userStore.user.id ? (
              <VisibleChip wishlist={wishlist} />
            ) : null}

            {wishlist.date ? (
              <Chip>
                Дата события: {new Date(wishlist.date).toLocaleDateString()}
              </Chip>
            ) : null}
            {user && user.id === userStore.user.id ? (
              <>
                {statistic?.totalSum ? (
                  <Chip color="warning">
                    Общая сумма: {statistic?.totalSum.toLocaleString()}
                  </Chip>
                ) : null}
                {statistic?.totalCount ? (
                  <Chip color="primary">
                    Исполнено: {statistic.fullfiledCount} из{" "}
                    {statistic.totalCount}
                  </Chip>
                ) : null}
              </>
            ) : null}
          </motion.div>
        </PageHeader>
      </div>
    );
  },
);

const Wishes = observer(({ wishlistUUID }: { wishlistUUID: string }) => {
  const router = useRouter();
  const [items, setItems] = useState<IWish[]>([]);
  const [visibleItems, setVisibleItems] = useState<IWish[]>([]);
  const [statistic, setStatistic] = useState<IStatistic>({} as IStatistic);
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

    setStatistic(calcStatistic(items));
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
    setItems([wish, ...items]);
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        <div className="col-span-full">
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
            {items.length ? (
              <div className="col-span-full flex gap-4">
                <WishFilter
                  hidedFilters={
                    isEditable || !userStore.user.id ? ["reserved"] : undefined
                  }
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

            <WishSaveModal
              isOpen={isOpen}
              wishlistUUID={wishlistUUID}
              onOpenChange={onOpenChange}
              onUpdate={onCreateWish}
            />
            <CardsList
              items={[
                isEditable ? (
                  <AddCardButton
                    className="md:h-75 w-full"
                    title="Добавить желание"
                    onPress={onOpen}
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
          </>
        )}
      </div>
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
