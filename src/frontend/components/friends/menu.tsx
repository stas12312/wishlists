"use client";
import { Dropdown, DropdownItem, DropdownMenu } from "@heroui/dropdown";
import { observer } from "mobx-react-lite";
import { Key } from "react";
import { MdDelete } from "react-icons/md";

import MenuTrigger from "../menu/trigger";

const FriendMenu = observer(
  ({ handleAction }: { handleAction: { (action: Key): void } }) => {
    return (
      <span className="flex items-center">
        <Dropdown>
          <MenuTrigger />
          <DropdownMenu aria-label="Wish actions" onAction={handleAction}>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<MdDelete />}
            >
              Удалить
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </span>
    );
  },
);

export default FriendMenu;
