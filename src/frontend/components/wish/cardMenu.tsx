import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Key } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

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
    <span>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly as="div" radius="lg" variant="light">
            <BsThreeDotsVertical />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Wish actions" onAction={handeAction}>
          {menuItems.map((value) => (
            <DropdownItem
              key={value.key}
              className={value.className}
              color={value.color}
              startContent={<value.icon />}
            >
              {value.title}
            </DropdownItem>
          ))}
          {/* {wish.actions.edit ? (
            <DropdownItem key="edit" startContent={<MdCreate />}>
              Редактировать
            </DropdownItem>
          ) : null}

          {wish.actions.reserve ? (
            <DropdownItem
              key="reserve"
              className="text-primary"
              color="primary"
              startContent={<MdOutlineBookmarkAdded />}
            >
              Забронировать
            </DropdownItem>
          ) : null}
          {wish.actions.make_full ? (
            <DropdownItem
              key="make_full"
              className="text-primary"
              color="primary"
              startContent={<MdOutlineCheck />}
            >
              Исполнено
            </DropdownItem>
          ) : null}
          {wish.actions.open_wishlist ? (
            <DropdownItem
              key="open_wishlist"
              className="text-primary"
              color="primary"
              startContent={<MdOutlineOpenInNew />}
            >
              Перейти в вишлист
            </DropdownItem>
          ) : null}
          {wish.actions.cancel_full ? (
            <DropdownItem
              key="cancel_full"
              className="text-primary"
              color="primary"
              startContent={<MdOutlineCancel />}
            >
              Не исполнено
            </DropdownItem>
          ) : null}
          {wish.actions.cancel_reserve ? (
            <DropdownItem
              key="cancel_reserve"
              className="text-danger"
              color="danger"
              startContent={<MdOutlineBookmarkRemove />}
            >
              Отменить бронь
            </DropdownItem>
          ) : null}
          {wish.actions.edit ? (
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<MdDelete />}
            >
              Удалить
            </DropdownItem>
          ) : null} */}
        </DropdownMenu>
      </Dropdown>
    </span>
  );
}
