"use client";
import { Avatar } from "@nextui-org/avatar";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Image } from "@nextui-org/image";
import { useDisclosure } from "@nextui-org/modal";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Key, useState } from "react";
import toast from "react-hot-toast";
import { AiFillGift } from "react-icons/ai";

import ConfirmationModal from "../confirmation";
import Desirability from "../desirability";

import { WishItemMenu } from "./cardMenu";
import WishFullCard from "./fullCard";
import WishSaveModal from "./saveModal";
import WishlistStatus from "./wishlistStatus";

import { getUserLink } from "@/lib/label";
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
    const router = useRouter();
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
        router.push(`/wishlists/${wish.wishlist_uuid}`);
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
                  <span className="text-xl">{item.name}</span>
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
                <div className="absolute flex flex-col items-center gap-1 m-1 w-[89%] z-10">
                  <WishlistStatus wish={item} />
                </div>
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
                <Link
                  className="md:hover:scale-[1.03] transition"
                  href={getUserLink(item.user.username)}
                >
                  <Chip avatar={<Avatar src={item.user.image} />}>
                    {item.user.name}
                  </Chip>
                </Link>

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
          onOpenChange={FullCardDisclosure.onOpenChange}
        />
      </>
    );
  },
);

function showMenu(actions: IWishActions): boolean {
  return actions.edit || actions.cancel_reserve || actions.reserve;
}
