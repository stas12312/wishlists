"use client";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useDisclosure } from "@heroui/modal";
import { observer } from "mobx-react-lite";
import { Key, useState } from "react";
import toast from "react-hot-toast";

import ConfirmationModal from "../confirmation";

import { WishItemMenu } from "./cardMenu";
import WishFullCard from "./fullCard";
import WishSaveModal from "./saveModal";
import CardImage from "./cardImage";

import { IWish, IWishActions } from "@/lib/models/wish";
import {
  cancelReserveWish,
  cancelWishFull,
  deleteWish,
  getWish,
  makeWishFull,
  reserveWish,
} from "@/lib/requests";

export const WishItem = observer(
  ({
    wish,
    onDelete,
    withUser = false,
  }: {
    wish: IWish;
    onDelete: { (wish: IWish): void };
    withUser?: boolean;
  }) => {
    const [item, setItem] = useState<IWish>(wish);
    const [isConfirm, setIsConfirm] = useState(false);
    const { isOpen, onOpenChange } = useDisclosure();
    const FullCardDisclosure = useDisclosure();

    async function onDeleteWish() {
      await onDelete(wish);
      await deleteWish(wish.uuid ?? "");
      setIsConfirm(false);
    }

    async function onWishUpdate(wish: IWish) {
      onOpenChange();
      setItem(wish);
    }

    async function handleOnAction(key: Key | string) {
      const wishUUID = wish.uuid ?? "";

      if (key === "delete" && wish.uuid) {
        setIsConfirm(true);
      }
      if (key === "edit") {
        onOpenChange();
      }
      if (key === "reserve") {
        const result = await reserveWish(wishUUID);
        if (result) {
          toast.error(result.message);
        } else {
          setItem(await getWish(wishUUID));
          toast.success("Желание забронировано");
        }
      }
      if (key === "cancel_reserve") {
        const result = await cancelReserveWish(wishUUID);
        if (result) {
          toast.error(result.message);
        } else {
          setItem(await getWish(wishUUID));
          toast.success("Бронь отменена");
        }
      }
      if (key === "make_full") {
        await makeWishFull(wishUUID);
        setItem(await getWish(wishUUID));
      }
      if (key === "cancel_full") {
        await cancelWishFull(wishUUID);
        setItem(await getWish(wishUUID));
      }
      if (key === "open_wishlist") {
        window.open(`/wishlists/${wish.wishlist_uuid}`);
      }
    }

    return (
      <>
        <div className="md:hover:scale-[1.03] duration-200">
          <Card
            className={`flex-col ${withUser ? "h-[340px]" : "h-[300px]"} w-full`}
            isPressable={true}
            onPress={() => {
              FullCardDisclosure.onOpen();
            }}
          >
            <CardHeader className="flex-col items-start">
              <div className="flex flex-row justify-between w-full h-[40px]">
                <p className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden text-ellipsis truncate">
                  <span className="text-xl" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-default-500" title={item.comment}>
                    {item.comment}
                  </span>
                </p>
                {showMenu(wish.actions) ? (
                  <span>
                    <WishItemMenu handeAction={handleOnAction} wish={item} />
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardBody>
              <CardImage
                removeWrapper
                className="h-full"
                iconClassName="h-full"
                wish={item}
              />
            </CardBody>
            {withUser ? (
              <CardFooter className="flex justify-between">
                <Chip avatar={<Avatar src={item.user.image} />}>
                  {item.user.name}
                </Chip>

                {item.wishlist.date ? (
                  <Chip color="warning">
                    {new Date(item.wishlist.date).toLocaleDateString()}
                  </Chip>
                ) : null}
              </CardFooter>
            ) : null}
          </Card>
        </div>
        <ConfirmationModal
          isOpen={isConfirm}
          message="Вы действительно хотите удалить желание?"
          onConfirm={onDeleteWish}
          onDecline={() => {
            setIsConfirm(false);
          }}
        />
        <WishSaveModal
          isOpen={isOpen}
          wish={item}
          wishlistUUID={wish.wishlist_uuid}
          onOpenChange={onOpenChange}
          onUpdate={onWishUpdate}
        />
        <WishFullCard
          handeAction={handleOnAction}
          isOpen={FullCardDisclosure.isOpen}
          wish={item}
          withUser={withUser}
          onOpenChange={FullCardDisclosure.onOpenChange}
        />
      </>
    );
  },
);

function showMenu(actions: IWishActions): boolean {
  return actions.edit || actions.cancel_reserve || actions.reserve;
}
