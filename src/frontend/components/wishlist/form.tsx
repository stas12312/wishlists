"use client";

import { IWishlist } from "@/lib/models";
import { createWishList, updateWishlist } from "@/lib/requests";
import { CalendarDate } from "@internationalized/date";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { I18nProvider } from "@react-aria/i18n";
import { FormEvent, useState } from "react";
import { MdOutlinePublic, MdOutlinePublicOff } from "react-icons/md";
import { Avatar } from "@nextui-org/avatar";

const visibleItems = [
  { key: "0", label: "Только мне", icon: <MdOutlinePublicOff /> },
  { key: "1", label: "Всем", icon: <MdOutlinePublic /> },
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
  }>({
    name: wishlist?.name || "",
    description: wishlist?.description || "",
    date: wishlist?.date || undefined,
    visible: wishlist?.visible || 0,
    uuid: wishlist?.uuid || "",
  });

  const [isCreating, setIsCreateing] = useState(false);

  async function handleSubmit(e: FormEvent) {
    setIsCreateing(true);
    e.preventDefault();
    let result: IWishlist;
    if (formData.uuid) {
      result = await updateWishlist(formData as IWishlist);
    } else {
      result = await createWishList(formData as IWishlist);
    }
    onCreate(result);
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
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
      dateValue.day
    );
    setFormData({
      ...formData,
      ["date"]: datetime.toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div>
        <Input
          fullWidth
          label="Название"
          value={formData.name}
          onChange={handleChange}
          name="name"
          isRequired
        />
      </div>
      <div>
        <Input
          fullWidth
          label="Описание"
          value={formData.description}
          onChange={handleChange}
          name="description"
        />
      </div>
      <div>
        <I18nProvider locale="ru-RU">
          <DatePicker
            label="Дата"
            name="date"
            value={
              formData.date ? dateStringToCalendarDate(formData.date) : null
            }
            onChange={setData}
          />
        </I18nProvider>
      </div>
      <Select
        label="Кому доступен"
        name="visible"
        onChange={handleChange}
        selectedKeys={[formData.visible.toString()]}
        classNames={{ trigger: "data-[hover=true]:bg-default-200" }}
      >
        {visibleItems.map((visible) => (
          <SelectItem
            key={visible.key}
            startContent={<Avatar icon={visible.icon}></Avatar>}
          >
            {visible.label}
          </SelectItem>
        ))}
      </Select>
      <div>
        <Button type="submit" fullWidth isLoading={isCreating}>
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
    date.getDate()
  );
}
