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
import {
  getWishlistAccent,
  getWishlistGradient,
} from "../wishlist/wishlistAppearance";

import CardImage from "./WishCardImage";
import { WishItemMenu } from "./WishCardMenu";
import WishFullCard from "./WishDrawer";
import { useWishActions } from "./useWishActions";

import { IWish, IWishActions } from "@/lib/models/wish";
import { IWishlist } from "@/lib/models/wishlist";
import { UserChip } from "@/components/user/UserChip";
import { getMenuItemsByActions, RESERVE_ACTION_KEYS } from "@/lib/wish/menu";
import userStore from "@/store/userStore";
export const WishItem = observer(
  ({
    wish,
    wishlist,
    onDelete = () => {},
    onUpdate = () => {},
    withUser = false,
    hideReservedStatus = false,
  }: {
    wish: IWish;
    wishlist?: IWishlist;
    onDelete?: { (wish: IWish, message: string): void };
    onUpdate?: { (wish: IWish): void };
    withUser?: boolean;
    hideReservedStatus?: boolean;
  }) => {
    const fullCardDrawer = useOverlayState();
    const accentClass = getWishlistAccent(
      wishlist?.uuid ?? wish.wishlist_uuid,
      wishlist?.settings?.color,
    );
    const { handleOnAction, modals } = useWishActions({
      wish,
      className: accentClass,
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
            accentClass,
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

          <div
            className={twMerge(
              "wishlist-card-backdrop absolute z-0 inset-0 rounded-3xl opacity-60 backdrop-saturate-200 backdrop-contrast-125",
              `bg-gradient-to-br ${getWishlistGradient(wishlist?.uuid ?? wish.wishlist_uuid, wishlist?.settings?.color)}`,
            )}
          />

          <Card.Header className="flex-col items-start p-0 z-10 relative">
            <div className="flex flex-row justify-between w-full min-h-14 gap-2 px-2.5 py-2">
              <div className="my-auto min-w-0 flex flex-col text-left overflow-hidden">
                <span
                  className="truncate text-xl/5 font-bold"
                  title={wish.name}
                >
                  {wish.name}
                </span>
                <span
                  className="truncate text-muted text-sm dark:text-white/80"
                  title={wish.comment}
                >
                  {wish.comment}
                </span>
              </div>
              {showMenu(wish.actions) ? (
                <span className="flex shrink-0 self-start items-center border border-gray-500/30 rounded-3xl">
                  <WishItemMenu
                    excludeKeys={RESERVE_ACTION_KEYS}
                    handeAction={handleOnAction}
                    overlayClassName={`${accentClass} wishlist-overlay`}
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
            <Card.Footer className="relative z-10 flex justify-between p-2">
              <UserChip
                className="wishlist-card-user-chip"
                user={wish.user}
                variant="secondary"
              />
              {wish.wishlist.date ? (
                <Chip
                  className="h-8"
                  color="warning"
                  size="lg"
                  variant="primary"
                >
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

const GLASS_BUTTON_CLASS_NAME = "wishlist-card-button backdrop-blur-lg border";

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

export function ReserveButton({
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
        className={GLASS_BUTTON_CLASS_NAME}
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
        "wishlist-card-danger-button",
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
