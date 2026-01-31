import {
  MdCreate,
  MdDelete,
  MdOutlineBookmarkAdded,
  MdOutlineCancel,
  MdOutlineCheck,
  MdOutlineOpenInNew,
  MdDriveFileMove,
  MdOutlineBookmarkRemove,
  MdContentCopy,
} from "react-icons/md";
import { IconType } from "react-icons";

import { IWishActions } from "../models/wish";

interface IWishMenuItem {
  actionKey?: keyof IWishActions | null;
  key: string;
  className: string;
  color?: "primary" | "danger" | "default";
  title?: string;
  icon: IconType;
  getTitleFunc?: { (actions: IWishActions): string };
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
    actionKey: "edit",
    key: "move",
    className: "text-primary",
    color: "primary",
    title: "Перенести",
    icon: MdDriveFileMove,
  },
  {
    actionKey: null,
    key: "copy",
    className: "text-primary",
    color: "primary",
    icon: MdContentCopy,
    getTitleFunc: (actions) => {
      return actions.edit ? "Копировать" : "Сохранить себе";
    },
  },
  {
    key: "reserve",
    className: "text-primary",
    color: "primary",
    title: "Забронировать",
    icon: MdOutlineBookmarkAdded,
  },
  {
    key: "cancel_reserve",
    className: "text-danger",
    color: "primary",
    title: "Отменить бронь",
    icon: MdOutlineBookmarkRemove,
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
    key: "delete",
    className: "text-danger",
    color: "danger",
    title: "Удалить",
    icon: MdDelete,
  },
];

export function getMenuItemsByActions(actions: IWishActions): IWishMenuItem[] {
  let items: IWishMenuItem[] = [];

  ACTIONS.forEach((action) => {
    let key = action.key as keyof IWishActions;
    if (
      (action.actionKey && actions[action.actionKey]) ||
      actions[key] ||
      action.actionKey === null
    )
      items.push(action);
  });
  return items;
}
