"use client";
import { Alert, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";

import { CustomBreadcrumbs } from "../Breadcrumbs";
import PageHeader from "../PageHeader";
import UserCard from "../user/UserCard";
import { VisibleChip } from "../VisibleChip";
import { IStatistic } from "../wish/WishList";

import WishlistItemMenu from "./WishlistMenu";

import { IWishlist } from "@/lib/models/wishlist";
import userStore from "@/store/userStore";

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
    return (
      <div className="flex flex-col">
        {user && user.id != userStore.user.id ? (
          <UserCard username={user.username} />
        ) : null}
        <PageHeader>
          <div className="flex justify-center md:justify-start gap-1">
            <CustomBreadcrumbs
              items={[
                {
                  title: isEditable ? "Вишлисты" : "Вишлисты пользователя",
                  href: isEditable ? "/" : `/users/${wishlist.user?.username}`,
                },
                {
                  title: wishlist.name,
                  href: `/wishlists/${wishlist.uuid}`,
                },
              ]}
            />
            <span className="my-auto">
              <WishlistItemMenu
                className="h-8"
                isEditable={isEditable}
                wishlist={wishlist}
                onDelete={onDelete}
                onRestore={() => {
                  onUpdate({ ...wishlist, is_active: true });
                }}
                onUpdate={onUpdate}
              />
            </span>
          </div>

          <span
            className="flex justify-center md:justify-start text-small text-default-500"
            title={wishlist.description}
          >
            {wishlist.description}
          </span>
          {isOwner || wishlist.date ? (
            <motion.div
              animate={{ opacity: 1, transition: { duration: 0.5 } }}
              className="flex gap-2 justify-center md:justify-start flex-wrap my-2"
              initial={{ opacity: 0 }}
            >
              {isOwner && wishlist.is_active ? (
                <VisibleChip wishlist={wishlist} />
              ) : null}
              {wishlist.date ? (
                <Chip size="lg">
                  Дата события: {new Date(wishlist.date).toLocaleDateString()}
                </Chip>
              ) : null}
              {isOwner ? (
                <>
                  {statistic?.totalSum ? (
                    <Chip color="warning" size="lg" variant="primary">
                      Общая сумма: {statistic?.totalSum.toLocaleString()}
                    </Chip>
                  ) : null}
                  {statistic?.totalCount ? (
                    <Chip color="accent" size="lg" variant="primary">
                      Исполнено: {statistic.fullfiledCount} из{" "}
                      {statistic.totalCount}
                    </Chip>
                  ) : null}
                </>
              ) : null}
            </motion.div>
          ) : null}
          {!wishlist.is_active ? (
            <motion.div
              animate={{ opacity: 1, transition: { duration: 0.5 } }}
              initial={{ opacity: 0 }}
            >
              <Alert
                color="danger"
                title="Вишлист архивирован и не доступен другим пользователям"
              />
            </motion.div>
          ) : null}
        </PageHeader>
      </div>
    );
  },
);
