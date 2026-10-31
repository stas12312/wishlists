import { Separator } from "@heroui/react";
import { motion } from "framer-motion";
import { useMemo } from "react";

import { WishItem } from "../wish/WishCard";
import { AnimatedList } from "../animated-list/AnimatedList";
import { WishlistChip } from "../wishlist/WishlistChip";

import { IUserInfo } from "./FeedList";

import { IWish } from "@/lib/models/wish";
import { UserChip } from "@/components/user/UserChip";

interface IWishlistInfo {
  uuid: string;
  name: string;
  wishes: IWish[];
}

export const UserEvents = ({
  userInfo,
  onUpdate,
}: {
  userInfo: IUserInfo;
  onUpdate?: { (wish: IWish): void };
}) => {
  const wishlists = useMemo(
    () => groupByWishlist(userInfo.wishes),
    [userInfo.wishes],
  );

  return (
    <div>
      {wishlists.map((wishlist) => (
        <div key={wishlist.uuid}>
          <Separator className="my-4" />
          <motion.div
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            className="flex flex-wrap items-center justify-center gap-2 md:justify-start"
            initial={{ opacity: 0 }}
          >
            <UserChip
              className="flex gap-2 shadow-md hover:bg-surface-secondary transition"
              user={userInfo.user}
              variant="secondary"
            />
            <span className="text-bold">
              добавил(а) <span className="hidden md:inline">желания </span>в
            </span>
            <WishlistChip
              className="flex gap-2 shadow-md hover:bg-surface-secondary transition"
              name={wishlist.name}
              uuid={wishlist.uuid}
              variant="secondary"
            />
          </motion.div>
          <WishesGrid wishes={wishlist.wishes} onUpdate={onUpdate} />
        </div>
      ))}
    </div>
  );
};

const WishesGrid = ({
  wishes,
  onUpdate,
}: {
  wishes: IWish[];
  onUpdate?: { (wish: IWish): void };
}) => (
  <div className="mx-auto my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
    <AnimatedList
      items={wishes.map((item) => {
        return (
          <div key={item.uuid}>
            <WishItem
              wish={{
                ...item,
                actions: { ...item.actions, open_wishlist: true },
              }}
              onUpdate={onUpdate}
            />
          </div>
        );
      })}
    />
  </div>
);

function groupByWishlist(wishes: IWish[]): IWishlistInfo[] {
  const groups = new Map<string, IWishlistInfo>();
  for (const wish of wishes) {
    let group = groups.get(wish.wishlist_uuid);
    if (!group) {
      group = {
        uuid: wish.wishlist_uuid,
        name: wish.wishlist.name,
        wishes: [],
      };
      groups.set(wish.wishlist_uuid, group);
    }
    group.wishes.push(wish);
  }
  return Array.from(groups.values());
}
