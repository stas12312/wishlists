import { IWish } from "@/lib/models";
import { deleteWish } from "@/lib/requests";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { useDisclosure } from "@nextui-org/modal";
import { Key, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  MdCreate,
  MdOutlineBookmarkAdded,
  MdOutlineBookmarkRemove,
  MdDelete,
  MdOutlineCheck,
  MdOutlineCancel,
} from "react-icons/md";
import ConfirmationModal from "../confirmation";
import WishSaveModal from "./saveModal";

export function WishItemMenu({
  wish,
  handeAction,
}: {
  wish: IWish;
  handeAction: { (key: Key): void };
}) {
  const [isConfirm, setIsConfirm] = useState(false);

  return (
    <span>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly as="div" radius="lg" variant="light">
            <BsThreeDotsVertical />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Wish actions" onAction={handeAction}>
          {wish.actions.edit ? (
            <DropdownItem key="edit" startContent={<MdCreate />}>
              Редактировать
            </DropdownItem>
          ) : null}

          {wish.actions.reserve ? (
            <DropdownItem
              key="reserve"
              color="primary"
              className="text-primary"
              startContent={<MdOutlineBookmarkAdded />}
            >
              Забронировать
            </DropdownItem>
          ) : null}
          {wish.actions.make_full ? (
            <DropdownItem
              key="make_full"
              color="primary"
              className="text-primary"
              startContent={<MdOutlineCheck />}
            >
              Исполнено
            </DropdownItem>
          ) : null}
          {wish.actions.cancel_full ? (
            <DropdownItem
              key="cancel_full"
              color="primary"
              className="text-primary"
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
          ) : null}
        </DropdownMenu>
      </Dropdown>
    </span>
  );
}

