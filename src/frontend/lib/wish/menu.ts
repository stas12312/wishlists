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
  buttonClassName?: string;
  title?: string;
  icon: IconType;
  getTitleFunc?: { (actions: IWishActions): string };
  variant:
    | "primary"
    | "secondary"
    | "danger"
    | "tertiary"
    | "ghost"
    | "outline"
    | "danger-soft";
}

export const RESERVE_BUTTON_CLASS_NAME =
  "bg-success/15 text-success hover:bg-success/25";

const ACTIONS: IWishMenuItem[] = [
  {
    key: "edit",
    className: "",
    title: "Редактировать",
    icon: MdCreate,
    variant: "secondary",
  },
  {
    actionKey: "edit",
    key: "move",
    className: "text-accent",
    title: "Перенести",
    icon: MdDriveFileMove,
    variant: "primary",
  },
  {
    actionKey: null,
    key: "copy",
    className: "text-accent",
    icon: MdContentCopy,
    variant: "primary",

    getTitleFunc: (actions) => {
      return actions.edit ? "Копировать" : "Сохранить себе";
    },
  },
  {
    key: "reserve",
    className: "text-accent",
    buttonClassName: RESERVE_BUTTON_CLASS_NAME,
    title: "Забронировать",
    icon: MdOutlineBookmarkAdded,
    variant: "primary",
  },
  {
    key: "cancel_reserve",
    className: "text-danger",
    title: "Отменить бронь",
    icon: MdOutlineBookmarkRemove,
    variant: "danger-soft",
  },
  {
    key: "make_full",
    className: "text-accent",
    title: "Исполнено",
    icon: MdOutlineCheck,
    variant: "primary",
  },
  {
    key: "open_wishlist",
    className: "text-accent",
    title: "Открыть вишлист",
    icon: MdOutlineOpenInNew,
    variant: "primary",
  },
  {
    key: "cancel_full",
    className: "text-accent",
    title: "Не исполнено",
    icon: MdOutlineCancel,
    variant: "primary",
  },
  {
    actionKey: "edit",
    key: "delete",
    className: "text-danger",
    title: "Удалить",
    icon: MdDelete,
    variant: "danger",
  },
];

export const RESERVE_ACTION_KEYS = ["reserve", "cancel_reserve"];

export function getMenuItemsByActions(
  actions: IWishActions,
  excludeKeys: string[] = [],
): IWishMenuItem[] {
  let items: IWishMenuItem[] = [];

  ACTIONS.forEach((action) => {
    if (excludeKeys.includes(action.key)) return;
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
