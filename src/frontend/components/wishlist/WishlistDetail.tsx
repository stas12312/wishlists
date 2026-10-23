"use client";
import {
  Alert,
  Button,
  Chip,
  ChipProps,
  toast,
  useOverlayState,
} from "@heroui/react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  MdDeleteOutline,
  MdOutlineEdit,
  MdOutlineShare,
  MdRestoreFromTrash,
} from "react-icons/md";

import { CustomBreadcrumbs } from "../Breadcrumbs";
import ConfirmationModal from "../ConfirmationModal";
import PageHeader from "../PageHeader";
import UserCard from "../user/UserCard";
import { IStatistic } from "../wish/WishList";

import WishlistSaveModal from "./WishlistSaveModal";

import { restoreWishlist } from "@/lib/client-requests/wishlist";
import { IWishlist, Visible } from "@/lib/models/wishlist";
import userStore from "@/store/userStore";

const visibleLabels: Record<Visible, string> = {
  [Visible.Private]: "только для меня",
  [Visible.Public]: "для всех",
  [Visible.ForFriends]: "для друзей",
  [Visible.ForSelectedFriends]: "для избранных друзей",
};

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
    const isOwner = user && user.id === userStore.user.id;

    const chips: { label: string; color: ChipProps["color"] }[] = [];
    if (wishlist.date) {
      chips.push({ label: formatEventDate(wishlist.date), color: "default" });
    }
    if (isOwner && wishlist.is_active) {
      chips.push({ label: visibleLabels[wishlist.visible], color: "accent" });
    }
    if (isOwner && statistic?.totalCount) {
      chips.push({
        label: `исполнено ${statistic.fullfiledCount} из ${statistic.totalCount}`,
        color: "success",
      });
    }
    if (isOwner && statistic?.totalSum) {
      chips.push({
        label: `на сумму ${statistic.totalSum.toLocaleString()}`,
        color: "warning",
      });
    }

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
        <PageHeader>
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-3 md:gap-y-2">
            <div className="min-w-0">
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
            <div className="flex items-center justify-center gap-2 md:col-start-2 md:row-start-1 md:row-span-2 md:self-center">
              {wishlist.is_active ? (
                <Button
                  isIconOnly
                  aria-label="Поделиться"
                  className="rounded-full"
                  variant="primary"
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
                      className="rounded-full"
                      variant="tertiary"
                      onPress={editOverlay.open}
                    >
                      <MdOutlineEdit className="text-lg" />
                    </Button>
                  ) : (
                    <Button
                      isIconOnly
                      aria-label="Восстановить"
                      className="rounded-full"
                      variant="tertiary"
                      onPress={restore}
                    >
                      <MdRestoreFromTrash className="text-lg" />
                    </Button>
                  )}
                  <Button
                    isIconOnly
                    aria-label={wishlist.is_active ? "Архивировать" : "Удалить"}
                    className="rounded-full"
                    variant="danger"
                    onPress={() => setIsConfirm(true)}
                  >
                    <MdDeleteOutline className="text-lg" />
                  </Button>
                </>
              ) : null}
            </div>
            {chips.length ? (
              <motion.div
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                className="flex flex-wrap items-center justify-center md:justify-start gap-2"
                initial={{ opacity: 0 }}
              >
                {chips.map((chip) => (
                  <Chip
                    key={chip.label}
                    color={chip.color}
                    size="lg"
                    variant="soft"
                  >
                    {chip.label}
                  </Chip>
                ))}
              </motion.div>
            ) : null}
          </div>

          {wishlist.description ? (
            <p
              className="text-sm text-muted mt-2 text-center md:text-left"
              title={wishlist.description}
            >
              {wishlist.description}
            </p>
          ) : null}
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

function formatEventDate(date: string): string {
  const eventDate = new Date(date);
  const isCurrentYear = eventDate.getFullYear() === new Date().getFullYear();
  return eventDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: isCurrentYear ? undefined : "numeric",
  });
}
