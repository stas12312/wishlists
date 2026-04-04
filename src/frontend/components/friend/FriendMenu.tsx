"use client";
import { Dropdown, Label } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { Key } from "react";
import { MdDelete } from "react-icons/md";

import MenuTrigger from "../menu/MenuTrigger";

const FriendMenu = observer(
  ({ handleAction }: { handleAction: { (action: Key): void } }) => {
    return (
      <span className="flex items-center">
        <Dropdown>
          <MenuTrigger name="friend-menu" />
          <Dropdown.Popover>
            <Dropdown.Menu aria-label="Wish actions" onAction={handleAction}>
              <Dropdown.Item
                className="text-danger"
                id="delete"
                variant="danger"
              >
                <MdDelete />
                <Label>Удалить</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </span>
    );
  },
);

export default FriendMenu;
