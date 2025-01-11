"use client";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Image } from "@nextui-org/image";
import { useDisclosure } from "@nextui-org/modal";
import { observer } from "mobx-react-lite";
import { Key, useState } from "react";
import toast from "react-hot-toast";
import { AiFillGift } from "react-icons/ai";
import { Avatar } from "@nextui-org/avatar";
import { useRouter } from "next/navigation";

import ConfirmationModal from "../confirmation";
import Desirability from "../desirability";

import { WishItemMenu } from "./card_menu";
import WishSaveModal from "./saveModal";

import { IWishActions } from "@/lib/models/wish";
import { IWish } from "@/lib/models/wish";
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
    const router = useRouter();
    const [item, setItem] = useState<IWish>(wish);
    const [isConfirm, setIsConfirm] = useState(false);
    const { isOpen, onOpenChange } = useDisclosure();

    async function onDeleteWish() {
      await onDelete(wish);
      await deleteWish(wish.uuid ?? "");
      setIsConfirm(false);
    }

    async function onWishUpdate(wish: IWish) {
      onOpenChange();
      setItem(wish);
    }

    async function handleOnAction(key: Key) {
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
        router.push(`/wishlists/${wish.wishlist_uuid}`);
      }
    }

    return (
      <>
        <Card
          className={`flex-col ${withUser ? "h-[340px]" : "h-[300px]"} md:hover:scale-[1.03] w-full`}
          isPressable={item.link !== null && item.link != ""}
          onPress={() => {
            window.open(item.link);
          }}
        >
          <CardHeader className="flex-col items-start">
            <div className="flex flex-row justify-between w-full h-[40px]">
              <p className="text-tiny font-bold my-auto flex flex-col text-left overflow-hidden text-ellipsis truncate">
                <span className="uppercase text-xl">{item.name}</span>
                <span className="text-default-500">{item.comment}</span>
              </p>
              {showMenu(wish.actions) ? (
                <span>
                  <WishItemMenu handeAction={handleOnAction} wish={item} />
                </span>
              ) : null}
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-full">
              {item.image ? (
                <Image
                  removeWrapper
                  className="z-0 object-cover w-full h-full"
                  src={item.image}
                />
              ) : (
                <div className=" bg-default-100 h-full rounded-large w-full flex">
                  <AiFillGift className="text-8xl mx-auto my-auto" />
                </div>
              )}
              <div className="z-1 absolute bottom-4 right-4 flex items-end w-full">
                <div className="mr-auto ml-8">
                  {item.desirability && item.desirability > 1 ? (
                    <Chip>
                      <Desirability onlyRead value={item.desirability} />
                    </Chip>
                  ) : null}
                </div>
                <div className="flex flex-col ml-auto mr-0 gap-1">
                  {item.fulfilled_at ? (
                    <Chip className="ml-auto mr-0" color="primary">
                      Исполнено
                    </Chip>
                  ) : null}
                  {item.is_reserved ? (
                    <Chip className="ml-auto mr-0" color="success">
                      Забронировано{" "}
                      {item.actions.cancel_reserve ? "вами" : null}
                    </Chip>
                  ) : null}
                  {item.cost ? (
                    <Chip className="ml-auto mr-0">
                      {item.cost.toLocaleString() + " ₽"}
                    </Chip>
                  ) : null}
                </div>
              </div>
            </div>
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
          wish={wish}
          wishlistUUID={wish.wishlist_uuid}
          onOpenChange={onOpenChange}
          onUpdate={onWishUpdate}
        />
      </>
    );
  },
);

function showMenu(actions: IWishActions): boolean {
  return actions.edit || actions.cancel_reserve || actions.reserve;
}
