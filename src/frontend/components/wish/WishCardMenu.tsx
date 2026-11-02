import { Dropdown, DropdownMenu } from "@heroui/react";
import { Key } from "react";

import MenuTrigger from "../menu/MenuTrigger";

import { IWish } from "@/lib/models/wish";
import { getMenuItemsByActions } from "@/lib/wish/menu";

export function WishItemMenu({
  wish,
  handeAction,
  excludeKeys,
  overlayClassName,
}: {
  wish: IWish;
  handeAction: { (key: Key): void };
  excludeKeys?: string[];
  overlayClassName?: string;
}) {
  const menuItems = getMenuItemsByActions(wish.actions, excludeKeys);
  return (
    <Dropdown>
      <MenuTrigger
        className="wishlist-card-menu-button backdrop-blur-sm"
        name="wish-menu"
      />
      <Dropdown.Popover
        className={`min-w-50 mr-2 bg-overlay/70 backdrop-blur-xl ${overlayClassName ?? ""}`}
      >
        <DropdownMenu aria-label="Wish actions" onAction={handeAction}>
          {menuItems.map((value) => (
            <Dropdown.Item
              key={value.key}
              className={value.className}
              id={value.key}
            >
              <value.icon />
              {value.getTitleFunc !== undefined
                ? value.getTitleFunc(wish.actions)
                : value.title}
            </Dropdown.Item>
          ))}
        </DropdownMenu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
