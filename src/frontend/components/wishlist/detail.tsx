"use client";
import { Alert } from "@heroui/alert";
import { Chip } from "@heroui/chip";
import { useDisclosure } from "@heroui/modal";
import { Skeleton } from "@heroui/skeleton";
import { User } from "@heroui/user";
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

import WishlistItemMenu from "./menu";

import { IError } from "@/lib/models";
import { IWish } from "@/lib/models/wish";
import { IWishlist } from "@/lib/models/wishlist";
import { deleteWishlist, getWishlist, updateWishlist } from "@/lib/requests";
import { getWishes } from "@/lib/requests/wish";
import { wrapUsername } from "@/lib/user";
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
    const router = useRouter();
    return (
      <div className="flex flex-col">
        {user && user.id != userStore.user.id ? (
          <div className="mx-auto mt-4">
            <User
              as="button"
              avatarProps={{
                name: user.name?.length ? user.name[0] : "",
                src: user.image,
                size: "lg",
              }}
              description={
                <span className="text-lg">{wrapUsername(user.username)}</span>
              }
              name={<span className="text-2xl">{user.name}</span>}
              onClick={() => {
                router.push(`/users/${user.username}`);
              }}
            />
          </div>
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
    async function fetchWishlists() {
      const response = await Promise.all([
        getWishes(wishlistUUID),
        getWishlist(wishlistUUID),
      ]);
      if ("message" in response[1]) {
        setError(response[1]);
      } else {
        setItems(response[0]);
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
  const components = items.map((wish: IWish) => (
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
