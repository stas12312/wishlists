import { Dropdown, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Key } from "react";

import MenuTrigger from "../menu/trigger";

import { IWish } from "@/lib/models/wish";
import { getMenuItemsByActions } from "@/lib/wish/menu";

export function WishItemMenu({
  wish,
  handeAction,
}: {
  wish: IWish;
  handeAction: { (key: Key): void };
}) {
  const menuItems = getMenuItemsByActions(wish.actions);
  return (
    <Dropdown>
      <MenuTrigger />
      <DropdownMenu aria-label="Wish actions" onAction={handeAction}>
        {menuItems.map((value) => (
          <DropdownItem
            key={value.key}
            className={value.className}
            color={value.color}
            startContent={<value.icon />}
          >
            {value.getTitleFunc !== undefined
              ? value.getTitleFunc(wish.actions)
              : value.title}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
