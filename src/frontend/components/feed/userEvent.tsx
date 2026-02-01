import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";

import { UserChip } from "../user";
import { WishItem } from "../wish/card";
import { CardsList } from "../cardsList/cardsList";

import { IUserInfo } from "./list";

import { IWish } from "@/lib/models/wish";

export const UserEvents = ({
  userInfo,
  onUpdate,
}: {
  userInfo: IUserInfo;
  onUpdate?: { (wish: IWish): void };
}) => {
  return (
    <div>
      <Divider className="my-4" />
      <motion.div
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        className="flex flex-col items-center justify md:flex-row"
        initial={{ opacity: 0 }}
      >
        <UserChip user={userInfo.user} variant="light" />{" "}
        <span className="text-bold text-foreground-500">
          добавил(а) желания
        </span>
      </motion.div>
      <div className="mx-auto my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        <CardsList
          items={userInfo.wishes.map((item) => {
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
    </div>
  );
};
