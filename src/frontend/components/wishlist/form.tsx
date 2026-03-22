"use client";

import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { FormEvent, Key, useEffect, useState } from "react";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";
import {
  Avatar,
  Button,
  Chip,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";

import { CustomDatePicker } from "../datePicker";
import { UserAvatar } from "../userAvatar";

import { getFriends } from "@/lib/client-requests/friend";
import { createWishList, updateWishlist } from "@/lib/client-requests/wishlist";
import { IWishlist, Visible } from "@/lib/models/wishlist";
import { IUser } from "@/lib/models/user";
import { dateStringToCalendarDate } from "@/lib/date";

const visibleItems = [
  { key: "1", label: "Всем по ссылке", icon: <MdOutlinePublic /> },
  { key: "0", label: "Только мне", icon: <MdOutlinePublicOff /> },
  { key: "2", label: "Друзьям", icon: <MdPerson /> },
  { key: "3", label: "Указанным друзьям", icon: <MdPerson /> },
];

export function WishlistCreateForm({
  onCreate,
  wishlist,
}: {
  onCreate: { (wishlist: IWishlist): void };
  wishlist?: IWishlist | undefined;
}) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    date: null | string;
    visible: number;
    uuid: string;
    visible_user_ids: number[];
  }>({
    name: wishlist?.name || "",
    description: wishlist?.description || "",
    date: wishlist?.date || null,
    visible: wishlist?.visible ?? Visible.Public,
    uuid: wishlist?.uuid || "",
    visible_user_ids: wishlist?.visible_user_ids || [],
  });
  const [friends, setFriends] = useState<IUser[]>([]);

  const [isCreating, setIsCreateing] = useState(false);

  async function handleSubmit(e: FormEvent) {
    setIsCreateing(true);
    e.preventDefault();
    let result: IWishlist;
    if (formData.visible != 4) {
    }

    let dataForSave = {
      ...formData,
      visible_user_ids: formData.visible == 3 ? formData.visible_user_ids : [],
    };

    if (formData.uuid) {
      result = await updateWishlist(dataForSave as IWishlist);
    } else {
      result = await createWishList(dataForSave as IWishlist);
    }
    onCreate(result);
  }

  useEffect(() => {
    async function fetchFriends() {
      setFriends(await getFriends());
    }
    fetchFriends();
  }, [formData.visible]);

  const setData = (dateValue: CalendarDate | null) => {
    let datetime = null;
    if (dateValue) {
      datetime = dateValue.toDate(getLocalTimeZone());
    }

    setFormData({
      ...formData,
      ["date"]: datetime ? datetime.toISOString() : null,
    });
  };
  return (
    <Form
      className="flex flex-col gap-3"
      id="wishlist"
      validationBehavior="native"
      onSubmit={handleSubmit}
    >
      <TextField
        isRequired
        name="name"
        validate={(value) => {
          if (value === "") {
            return "Заполните это поле";
          }
          return null;
        }}
        value={formData.name}
        variant="secondary"
        onChange={(value) => {
          setFormData({ ...formData, name: value });
        }}
      >
        <Label>Название</Label>
        <Input
          fullWidth

          // onClear={() => setFormData({ ...formData, name: "" })}
        />
      </TextField>

      <TextField
        name="description"
        value={formData.description}
        variant="secondary"
        onChange={(value) => setFormData({ ...formData, description: value })}
      >
        <Label>Описание</Label>
        <TextArea fullWidth />
      </TextField>

      <CustomDatePicker
        label="Дата события"
        name="date"
        value={dateStringToCalendarDate(formData.date)}
        variant="secondary"
        onChange={setData}
      />
      <Select
        disabledKeys={
          friends.length == 0 && formData.visible_user_ids.length == 0
            ? ["3"]
            : undefined
        }
        name="visible"
        value={formData.visible.toString()}
        variant="secondary"
        onChange={(value) => {
          setFormData({
            ...formData,
            visible: parseInt(value?.toString() ?? "1"),
          });
        }}
      >
        <Label>Кому доступен</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {visibleItems.map((visible) => (
              <ListBox.Item
                key={visible.key}
                id={visible.key}
                textValue={visible.label}
              >
                <div className="flex items-center gap-2">
                  <Avatar size="sm">{visible.icon}</Avatar>
                  {visible.label}
                </div>

                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      {formData.visible == 3 ? (
        <Select
          isRequired
          selectionMode="multiple"
          value={formData?.visible_user_ids.map((value) => {
            return value;
          })}
          variant="secondary"
          onChange={(keys: Key[]) => {
            const ids = keys.map((value) => {
              return Number(value);
            });
            setFormData({
              ...formData,
              visible_user_ids: ids,
            });
          }}
        >
          <Label>Выберите друзей</Label>
          <Select.Trigger>
            <Select.Value>
              {({ defaultChildren, isPlaceholder, state }) => {
                if (isPlaceholder || state.selectedItems.length === 0) {
                  return defaultChildren;
                }
                const selectedItems = state.selectedItems;
                const selectedItem = friends.find(
                  (user) => user.id === selectedItems[0]?.key,
                );
                if (!selectedItem) {
                  return defaultChildren;
                }
                return (
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map((userId) => {
                      const user = friends.find(
                        (user) => user.id == userId.key,
                      );
                      if (!user) {
                        return <></>;
                      }
                      return (
                        <Chip key={user.id}>
                          <UserAvatar
                            description=""
                            image={user.image}
                            name={user.name}
                            size="sm"
                          />
                        </Chip>
                      );
                    })}
                  </div>
                );
              }}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox selectionMode="multiple">
              {friends.map((user) => {
                return (
                  <ListBox.Item
                    key={user.id}
                    id={user.id}
                    textValue={user.name}
                  >
                    <div className="flex gap-2 items-center">
                      <UserAvatar
                        description=""
                        image={user.image}
                        name={user.name[0]}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <span className="text-small">{user.name}</span>
                        <span className="text-tiny text-default-400">
                          {user.username}
                        </span>
                      </div>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
        </Select>
      ) : null}
      <Button fullWidth isPending={isCreating} type="submit">
        Сохранить
      </Button>
    </Form>
  );
}
