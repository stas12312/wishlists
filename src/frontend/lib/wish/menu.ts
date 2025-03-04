import {
  MdCreate,
  MdDelete,
  MdOutlineBookmarkAdded,
  MdOutlineBookmarkRemove,
  MdOutlineCancel,
  MdOutlineCheck,
  MdOutlineOpenInNew,
  MdDriveFileMove,
} from "react-icons/md";
import { IconType } from "react-icons";

import { IWishActions } from "../models/wish";

interface IWishMenuItem {
  actionKey?: keyof IWishActions;
  key: string;
  className: string;
  color?: "primary" | "danger" | "default";
  title: string;
  icon: IconType;
}

const ACTIONS: IWishMenuItem[] = [
  {
    key: "edit",
    className: "",
    color: "default",
    title: "Редактировать",
    icon: MdCreate,
  },
  {
    key: "reserve",
    className: "text-primary",
    color: "primary",
    title: "Забронировать",
    icon: MdOutlineBookmarkAdded,
  },
  {
    key: "make_full",
    className: "text-primary",
    color: "primary",
    title: "Исполнено",
    icon: MdOutlineCheck,
  },
  {
    key: "open_wishlist",
    className: "text-primary",
    color: "primary",
    title: "Открыть вишлист",
    icon: MdOutlineOpenInNew,
  },
  {
    key: "cancel_full",
    className: "text-primary",
    color: "primary",
    title: "Не исполнено",
    icon: MdOutlineCancel,
  },
  {
    key: "cancel_reserve",
    className: "text-danger",
    color: "primary",
    title: "Отменить бронь",
    icon: MdOutlineBookmarkRemove,
  },
  {
    actionKey: "edit",
    key: "delete",
    className: "text-danger",
    color: "danger",
    title: "Удалить",
    icon: MdDelete,
  },
  {
    actionKey: "edit",
    key: "move",
    className: "text-primary",
    color: "primary",
    title: "Перенести",
    icon: MdDriveFileMove,
  },
];

export function getMenuItemsByActions(actions: IWishActions): IWishMenuItem[] {
  let items: IWishMenuItem[] = [];

  ACTIONS.forEach((action) => {
    let key = action.key as keyof IWishActions;
    if ((action.actionKey && actions[action.actionKey]) || actions[key])
      items.push(action);
  });
  return items;
}
