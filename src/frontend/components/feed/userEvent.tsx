import { Divider } from "@heroui/react";

import { UserChip } from "../user";
import { WishItem } from "../wish/card";

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
      <div className="flex flex-col items-center justify md:flex-row">
        <UserChip user={userInfo.user} variant="light" />{" "}
        <span className="text-bold text-foreground-500">добавил желания</span>
      </div>
      <div className="mx-auto my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {userInfo.wishes.map((item) => {
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
      </div>
    </div>
  );
};
