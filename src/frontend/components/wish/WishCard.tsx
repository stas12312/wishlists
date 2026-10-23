"use client";
import { Button, Card, Chip, useOverlayState } from "@heroui/react";
import { observer } from "mobx-react-lite";
import {
  MdOutlineBookmarkAdded,
  MdOutlineBookmarkRemove,
} from "react-icons/md";
import { usePress } from "react-aria";
import { twMerge } from "tailwind-merge";

import { ResponsiveImage } from "../ResponsiveImage";

import CardImage from "./WishCardImage";
import { WishItemMenu } from "./WishCardMenu";
import WishFullCard from "./WishDrawer";
import { useWishActions } from "./useWishActions";

import { IWish, IWishActions } from "@/lib/models/wish";
import { UserChip } from "@/components/user/UserChip";
import { getMenuItemsByActions, RESERVE_ACTION_KEYS } from "@/lib/wish/menu";
import userStore from "@/store/userStore";
export const WishItem = observer(
  ({
    wish,
    onDelete = () => {},
    onUpdate = () => {},
    withUser = false,
    hideReservedStatus = false,
  }: {
    wish: IWish;
    onDelete?: { (wish: IWish, message: string): void };
    onUpdate?: { (wish: IWish): void };
    withUser?: boolean;
    hideReservedStatus?: boolean;
  }) => {
    const fullCardDrawer = useOverlayState();
    const { handleOnAction, modals } = useWishActions({
      wish,
      onDelete,
      onUpdate,
    });

    const reserveAction = getReserveAction(wish);
    const withReserveButton = reserveAction !== null;

    let { pressProps } = usePress({
      onPress: () => fullCardDrawer.open(),
    });

    return (
      <>
        <Card
          className={twMerge(
            withUser ? "h-90" : "h-70",
            "flex-col w-full ring-1 ring-gray-500/30 p-0 relative overflow-hidden isolate cursor-pointer gap-0",
            "hover:scale-[1.03] active:scale-[0.97]",
            "transition-transform will-change-transform transform-gpu",
          )}
          {...pressProps}
        >
          {wish.images && wish.images[0] ? (
            <div className="absolute bottom-[50%] transform-[translateZ(0)]">
              <ResponsiveImage
                alt="Изображение желания"
                className="z-0 blur-xl"
                src={wish.images[0]}
              />
            </div>
          ) : null}

          <div className="bg-default/50 absolute z-0 inset-0 rounded-3xl backdrop-saturate-200 backdrop-contrast-125" />

          <Card.Header className="flex-col items-start p-0 z-10 relative">
            <div className="flex flex-row justify-between w-full h-14 px-2.5 pt-2">
              <div className="my-auto flex flex-col text-left overflow-hidden text-ellipsis truncate">
                <span className="text-xl/5 font-bold" title={wish.name}>
                  {wish.name}
                </span>
                <span
                  className="text-gray text-[14px] text-sm"
                  title={wish.comment}
                >
                  {wish.comment}
                </span>
              </div>
              {showMenu(wish.actions) ? (
                <span className="flex items-center absolute top-2 right-2 border border-gray-500/30 rounded-3xl">
                  <WishItemMenu
                    excludeKeys={RESERVE_ACTION_KEYS}
                    handeAction={handleOnAction}
                    wish={wish}
                  />
                </span>
              ) : null}
            </div>
          </Card.Header>
          <Card.Content className="relative min-h-0 flex-1">
            <CardImage
              chipsClassName={withReserveButton ? "bottom-12" : undefined}
              className="h-full"
              hideReservedStatus={hideReservedStatus}
              iconClassName="h-full"
              wish={wish}
            />
            {reserveAction ? (
              <div className="absolute inset-x-2 bottom-2 z-20">
                <ReserveButton
                  action={reserveAction}
                  onPress={() => handleOnAction(reserveAction)}
                />
              </div>
            ) : null}
          </Card.Content>
          {withUser ? (
            <Card.Footer className="flex justify-between p-2">
              <UserChip user={wish.user} variant="secondary" />
              {wish.wishlist.date ? (
                <Chip color="warning" size="lg" variant="primary">
                  {new Date(wish.wishlist.date).toLocaleDateString()}
                </Chip>
              ) : null}
            </Card.Footer>
          ) : null}
        </Card>
        <WishFullCard
          handeAction={handleOnAction}
          isOpen={fullCardDrawer.isOpen}
          wish={wish}
          withUser={withUser}
          onOpenChange={fullCardDrawer.toggle}
        />
        {modals}
      </>
    );
  },
);

// Same glass as the price chips, so the buttons stay readable on any image.
const GLASS_BUTTON_CLASS_NAME =
  "bg-default/90 backdrop-blur-lg border border-gray-500/30 hover:bg-default";

type ReserveAction = "reserve" | "cancel_reserve";

function getReserveAction(wish: IWish): ReserveAction | null {
  if (wish.actions.edit || userStore.user.id <= 0) return null;
  if (wish.actions.reserve) return "reserve";
  // A fulfilled gift can still be un-reserved, but only from the full card.
  if (wish.actions.cancel_reserve && !wish.fulfilled_at) {
    return "cancel_reserve";
  }

  return null;
}

function ReserveButton({
  action,
  onPress,
}: {
  action: ReserveAction;
  onPress: () => void;
}) {
  if (action === "reserve") {
    return (
      <Button
        fullWidth
        className={twMerge(
          GLASS_BUTTON_CLASS_NAME,
          "text-green-700 dark:text-success border-success/30",
          "bg-[color-mix(in_oklab,var(--color-success)_18%,var(--color-default))]",
          "hover:bg-[color-mix(in_oklab,var(--color-success)_28%,var(--color-default))]",
        )}
        size="sm"
        variant="tertiary"
        onPress={onPress}
      >
        <MdOutlineBookmarkAdded />
        Забронировать
      </Button>
    );
  }

  return (
    <Button
      fullWidth
      className={twMerge(
        GLASS_BUTTON_CLASS_NAME,
        "text-danger border-danger/30",
        "bg-[color-mix(in_oklab,var(--color-danger)_18%,var(--color-default))]",
        "hover:bg-[color-mix(in_oklab,var(--color-danger)_28%,var(--color-default))]",
      )}
      size="sm"
      variant="tertiary"
      onPress={onPress}
    >
      <MdOutlineBookmarkRemove />
      Отменить бронь
    </Button>
  );
}

function showMenu(actions: IWishActions): boolean {
  return getMenuItemsByActions(actions, RESERVE_ACTION_KEYS).length > 0;
}
