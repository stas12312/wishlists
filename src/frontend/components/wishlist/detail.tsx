"use client";
import { Chip } from "@nextui-org/chip";
import { useDisclosure } from "@nextui-org/modal";
import { User } from "@nextui-org/user";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Alert } from "@nextui-org/alert";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { Skeleton } from "@nextui-org/skeleton";

import AddCardButton from "../AddCardButton";
import { VisibleStatus } from "../visibleIcon";
import { WishItem } from "../wish/card";
import WishSaveModal from "../wish/saveModal";
import PageHeader from "../pageHeader";
import { PageSpinner } from "../pageSpinner";

import { WishlistItemMenu } from "./card";

import { IError } from "@/lib/models";
import { IWish } from "@/lib/models/wish";
import { IWishlist } from "@/lib/models/wishlist";
import {
  deleteWishlist,
  getWishes,
  getWishlist,
  updateWishlist,
} from "@/lib/requests";
import userStore from "@/store/userStore";

const WishlistDetail = observer(
  ({
    wishlist,
    onUpdate,
    onDelete,
    isEditable,
  }: {
    wishlist: IWishlist;
    onUpdate: { (wishlist: IWishlist): void };
    onDelete: { (wishlist: IWishlist): void };
    isEditable: boolean;
  }) => {
    const user = wishlist.user;
    const router = useRouter();
    return (
      <div className="flex flex-col">
        {user && user.id != userStore.user.id ? (
          <div className="mx-auto mb-4">
            <User
              as="button"
              avatarProps={{
                name: user.name?.length ? user.name[0] : "",
                src: user.image,
                size: "lg",
              }}
              description={<span className="text-lg">{user.username}</span>}
              name={<span className="text-2xl">{user.name}</span>}
              onClick={() => {
                router.push(`/users/${user.username}`);
              }}
            />
          </div>
        ) : null}
        <PageHeader>
          <div className="flex">
            <span>
              <div className="flex flex-row gap-2 justify-center lg:justify-start">
                <span className={"text-2xl"}>{wishlist.name}</span>
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
          <div className="text-small text-default-500 flex gap-2">
            {wishlist.date ? (
              <Chip>{new Date(wishlist.date).toLocaleDateString()}</Chip>
            ) : null}
            <span className="my-auto">{wishlist.description}</span>
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
      }
    }
    fetchWishlists();
  }, []);

  function onDeleteWish(wish: IWish) {
    setItems(
      items.filter((value) => {
        return value.uuid !== wish.uuid;
      }),
    );
    toast.success("Желание удалено");
  }

  async function onCreateWish(wish: IWish) {
    onOpenChange();
    items.push(wish);
  }

  async function onDeleteWishlist(wishlist: IWishlist) {
    await deleteWishlist(wishlist.uuid);
    toast.success("Вишлист удален");
    router.push("/");
  }

  async function onUpdateWishlist(wishlist: IWishlist) {
    const updatedWishlist = await updateWishlist(wishlist);
    setWishlist(updatedWishlist);
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
      <WishItem wish={wish} onDelete={onDeleteWish} />
    </div>
  ));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      <div className="col-span-full">
        {isLoading ? (
          <PageHeader>
            <div>
              <Skeleton className="h-[32px] w-1/5 rounded-full" />
            </div>
            <div>
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
                  endContent={
                    <Button
                      as={Link}
                      className="ml-4"
                      color="warning"
                      href="/auth/login"
                      variant="bordered"
                    >
                      Войти
                    </Button>
                  }
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
            <AddCardButton className="md:h-[300px]" onPress={onOpen} />
          ) : null}
          {components}
        </>
      )}
    </div>
  );
});

export default Wishes;
