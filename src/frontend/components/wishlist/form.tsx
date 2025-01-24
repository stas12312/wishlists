"use client";

import { CalendarDate } from "@internationalized/date";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { I18nProvider } from "@react-aria/i18n";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";
import { Avatar } from "@nextui-org/avatar";
import { Chip } from "@nextui-org/chip";

import { createWishList, getFriends, updateWishlist } from "@/lib/requests";
import { IWishlist } from "@/lib/models/wishlist";
import { IUser } from "@/lib/models/user";

const visibleItems = [
  { key: "0", label: "Только мне", icon: <MdOutlinePublicOff /> },
  { key: "1", label: "Всем", icon: <MdOutlinePublic /> },
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
    date: undefined | string;
    visible: number;
    uuid: string;
    visible_user_ids: number[];
  }>({
    name: wishlist?.name || "",
    description: wishlist?.description || "",
    date: wishlist?.date || undefined,
    visible: wishlist?.visible || 0,
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
    async function fetchUsers() {
      setFriends(await getFriends());
    }
    if (formData.visible == 3) {
      fetchUsers();
    }
  }, [formData.visible]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    let { name, value } = e.target;

    if (name == "visible") {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const setData = (dateValue: CalendarDate) => {
    const datetime = new Date(
      dateValue.year,
      dateValue.month - 1,
      dateValue.day,
    );

    setFormData({
      ...formData,
      ["date"]: datetime.toISOString(),
    });
  };

  return (
    <form
      className="flex flex-col space-y-4"
      name="wishlist"
      onSubmit={handleSubmit}
    >
      <div>
        <Input
          fullWidth
          isRequired
          label="Название"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div>
        <Input
          fullWidth
          label="Описание"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div>
        <I18nProvider locale="ru-RU">
          <DatePicker
            cle
            label="Дата события"
            name="date"
            /* @ts-ignore */
            value={
              formData.date ? dateStringToCalendarDate(formData.date) : null
            }
            /* @ts-ignore */
            onChange={setData}
          />
        </I18nProvider>
      </div>
      <Select
        label="Кому доступен"
        name="visible"
        selectedKeys={[formData.visible.toString()]}
        onChange={handleChange}
      >
        {visibleItems.map((visible) => (
          <SelectItem
            key={visible.key}
            startContent={<Avatar icon={visible.icon} />}
          >
            {visible.label}
          </SelectItem>
        ))}
      </Select>
      {formData.visible == 3 ? (
        <Select
          isRequired
          isMultiline={true}
          items={friends}
          label="Выберите друзей"
          renderValue={(items) => {
            return (
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <Chip
                    key={item.key}
                    avatar={
                      <Avatar
                        name={item.data?.name[0]}
                        src={item.data?.image}
                      />
                    }
                  >
                    {item.data?.name}
                  </Chip>
                ))}
              </div>
            );
          }}
          selectedKeys={formData?.visible_user_ids.map((value) => {
            return String(value);
          })}
          selectionMode="multiple"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const ids = e.target.value.split(",").map((value) => {
              return Number(value);
            });
            setFormData({
              ...formData,
              visible_user_ids: ids,
            });
          }}
        >
          {(user) => (
            <SelectItem key={user.id}>
              <div className="flex gap-2 items-center">
                <Avatar
                  alt={user.name}
                  className="flex-shrink-0"
                  name={user.name[0]}
                  size="sm"
                  src={user.image}
                />
                <div className="flex flex-col">
                  <span className="text-small">{user.name}</span>
                  <span className="text-tiny text-default-400">
                    {user.username}
                  </span>
                </div>
              </div>
            </SelectItem>
          )}
        </Select>
      ) : null}
      <div>
        <Button fullWidth isLoading={isCreating} type="submit">
          Сохранить
        </Button>
      </div>
    </form>
  );
}

function dateStringToCalendarDate(dateString: string): CalendarDate {
  const date = new Date(dateString);

  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}
