"use client";
import { Alert, Button, Link, toast, useOverlayState } from "@heroui/react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MdDeleteOutline,
  MdOutlineEdit,
  MdOutlineShare,
  MdRestoreFromTrash,
} from "react-icons/md";

import ConfirmationModal from "../ConfirmationModal";
import PageHeader from "../PageHeader";
import UserCard from "../user/UserCard";
import { IStatistic } from "../wish/WishList";

import { WishlistChips } from "./WishlistChips";
import WishlistSaveModal from "./WishlistSaveModal";
import {
  DEFAULT_WISHLIST_EMOJI,
  getWishlistAccent,
  getWishlistGradient,
} from "./wishlistAppearance";

import { restoreWishlist } from "@/lib/client-requests/wishlist";
import { IWishlist } from "@/lib/models/wishlist";
import userStore from "@/store/userStore";

const GLASS_BUTTON_CLASS =
  "wishlist-glass-button rounded-full backdrop-blur-sm";

const SHARE_BUTTON_CLASS =
  "wishlist-accent-button rounded-full backdrop-blur-sm";

const DANGER_BUTTON_CLASS =
  "wishlist-danger-button rounded-full backdrop-blur-sm";

export const WishlistDetail = observer(
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
    const router = useRouter();
    const isOwner = user && user.id === userStore.user.id;
    const gradient = getWishlistGradient(
      wishlist.uuid,
      wishlist.settings?.color,
    );

    const editOverlay = useOverlayState();
    const [isConfirm, setIsConfirm] = useState(false);

    async function restore() {
      await restoreWishlist(wishlist.uuid);
      onUpdate({ ...wishlist, is_active: true });
      toast("Вишлист восстановлен");
    }

    function shareWishlist() {
      navigator.clipboard.writeText(
        `${window.location.origin}/wishlists/${wishlist.uuid}`,
      );
      toast.success("Ссылка на вишлист скопирована");
    }

    return (
      <div className="flex flex-col">
        {user && user.id != userStore.user.id ? (
          <UserCard username={user.username} />
        ) : null}
        <PageHeader dividerClassName="mt-3 mb-4">
          <Link
            className="mx-auto text-2xl text-muted md:mx-0"
            onPress={() => {
              router.push(
                isEditable ? "/" : `/users/${wishlist.user?.username}`,
              );
            }}
          >
            {isEditable ? "Вишлисты" : "Вишлисты пользователя"}
          </Link>
          <div
            className={`group relative mt-2 overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} ${
              !wishlist.is_active ? "grayscale" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-4 flex size-52 rotate-[-18deg] select-none items-center justify-center text-[180px] leading-none opacity-[0.16] transition-transform duration-500 ease-out [mask-image:linear-gradient(135deg,transparent_5%,black_65%)] group-focus-within:rotate-[-8deg] group-focus-within:scale-110 motion-reduce:transition-none motion-reduce:group-focus-within:transform-none dark:opacity-[0.12] md:group-hover:rotate-[-8deg] md:group-hover:scale-110 motion-reduce:md:group-hover:transform-none"
            >
              {wishlist.settings?.emoji || DEFAULT_WISHLIST_EMOJI}
            </span>
            <div className="absolute -right-10 -top-16 size-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 right-1/4 size-32 rounded-full bg-black/10" />
            <div className="relative z-10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 p-3 md:gap-x-4 md:p-4">
              <div className="row-start-1 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/40 shadow-[0_4px_12px_rgba(15,23,42,0.24)] dark:bg-white/15 backdrop-blur-sm">
                <span
                  aria-label="Эмодзи вишлиста"
                  className="text-3xl drop-shadow-[0_2px_3px_rgba(15,23,42,0.4)]"
                  role="img"
                >
                  {wishlist.settings?.emoji || DEFAULT_WISHLIST_EMOJI}
                </span>
              </div>
              <div className="col-start-3 row-start-1 flex items-center gap-2">
                {wishlist.is_active ? (
                  <Button
                    isIconOnly
                    aria-label="Поделиться"
                    className={SHARE_BUTTON_CLASS}
                    variant="tertiary"
                    onPress={shareWishlist}
                  >
                    <MdOutlineShare className="text-lg" />
                  </Button>
                ) : null}
                {isEditable ? (
                  <>
                    {wishlist.is_active ? (
                      <Button
                        isIconOnly
                        aria-label="Редактировать"
                        className={GLASS_BUTTON_CLASS}
                        variant="tertiary"
                        onPress={editOverlay.open}
                      >
                        <MdOutlineEdit className="text-lg" />
                      </Button>
                    ) : (
                      <Button
                        isIconOnly
                        aria-label="Восстановить"
                        className={GLASS_BUTTON_CLASS}
                        variant="tertiary"
                        onPress={restore}
                      >
                        <MdRestoreFromTrash className="text-lg" />
                      </Button>
                    )}
                    <Button
                      isIconOnly
                      aria-label={
                        wishlist.is_active ? "Архивировать" : "Удалить"
                      }
                      className={DANGER_BUTTON_CLASS}
                      variant="tertiary"
                      onPress={() => setIsConfirm(true)}
                    >
                      <MdDeleteOutline className="text-lg" />
                    </Button>
                  </>
                ) : null}
              </div>
              <div className="col-span-full row-start-2 flex min-w-0 flex-col items-center gap-1 md:col-span-1 md:col-start-2 md:row-start-1 md:items-start">
                <h1
                  className="max-w-full truncate text-xl font-semibold text-slate-900 dark:text-white md:text-2xl"
                  title={wishlist.name}
                >
                  {wishlist.name}
                </h1>
                {wishlist.description ? (
                  <p
                    className="max-w-full truncate text-center text-sm text-slate-700 dark:text-white/80 md:text-left md:text-base"
                    title={wishlist.description}
                  >
                    {wishlist.description}
                  </p>
                ) : null}
              </div>
              <WishlistChips
                className="col-span-full justify-center md:row-start-2 md:justify-start"
                isOwner={!!isOwner}
                statistic={statistic}
                wishlist={wishlist}
              />
            </div>
          </div>
          {!wishlist.is_active ? (
            <motion.div
              animate={{ opacity: 1, transition: { duration: 0.5 } }}
              className="mt-2"
              initial={{ opacity: 0 }}
            >
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>
                    Вишлист архивирован и не доступен другим пользователям
                  </Alert.Title>
                </Alert.Content>
              </Alert>
            </motion.div>
          ) : null}
        </PageHeader>
        <WishlistSaveModal
          className={getWishlistAccent(wishlist.uuid, wishlist.settings?.color)}
          isOpen={editOverlay.isOpen}
          wishlist={wishlist}
          onOpenChange={editOverlay.toggle}
          onSaveWishlist={(updatedWishlist) => {
            editOverlay.close();
            onUpdate(updatedWishlist);
          }}
        />
        <ConfirmationModal
          isOpen={isConfirm}
          message={`Вы действительно хотите ${wishlist.is_active ? "архивировать" : "удалить"} вишлист?`}
          onConfirm={async () => {
            await onDelete(wishlist);
            setIsConfirm(false);
          }}
          onDecline={() => setIsConfirm(false)}
        />
      </div>
    );
  },
);
