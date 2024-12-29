"use client";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Image } from "@nextui-org/image";
import { Key, useState } from "react";

import { IWish, IWishActions } from "@/lib/models";
import {
  cancelReserveWish,
  cancelWishFull,
  deleteWish,
  getWish,
  makeWishFull,
  reserveWish,
} from "@/lib/requests";
import { observer } from "mobx-react-lite";
import toast from "react-hot-toast";
import { WishItemMenu } from "./card_menu";
import ConfirmationModal from "../confirmation";
import WishSaveModal from "./saveModal";
import { useDisclosure } from "@nextui-org/modal";

export const WishItem = observer(
  ({ wish, onDelete }: { wish: IWish; onDelete: { (wish: IWish): void } }) => {
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
    }

    return (
      <>
        <Card
          className="flex-col h-[300px] md:hover:scale-[1.03] w-full"
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
                  <WishItemMenu wish={item} handeAction={handleOnAction} />
                </span>
              ) : null}
            </div>
          </CardHeader>
          <CardBody>
            <Image
              removeWrapper
              className="z-0 object-cover w-full h-full"
              src={item.image ? item.image : undefined}
            />
          </CardBody>
          <CardFooter className="z-10 absolute bottom-1 right-1 justify-end">
            <div className="flex flex-col gap-1 ml-auto mr-0">
              {item.fulfilled_at ? (
                <Chip color="primary" className="ml-auto mr-0">
                  Исполнено
                </Chip>
              ) : null}
              {item.is_reserved ? (
                <Chip color="success" className="ml-auto mr-0">
                  Забронировано {item.actions.cancel_reserve ? "вами" : null}
                </Chip>
              ) : null}
              {item.cost ? (
                <Chip className="ml-auto mr-0">
                  {item.cost.toLocaleString() + " ₽"}
                </Chip>
              ) : null}
            </div>
          </CardFooter>
        </Card>
        <ConfirmationModal
          onConfirm={onDeleteWish}
          isOpen={isConfirm}
          message="Вы действительно хотите удалить желание?"
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
  }
);

function showMenu(actions: IWishActions): boolean {
  return actions.edit || actions.cancel_reserve || actions.reserve;
}
