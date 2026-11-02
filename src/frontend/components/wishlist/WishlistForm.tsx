"use client";

import {
  Avatar,
  Chip,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  CalendarDate,
  getLocalTimeZone,
  minDate,
  today,
} from "@internationalized/date";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { FormEvent, Key, useEffect, useState } from "react";
import { MdOutlinePublic, MdOutlinePublicOff, MdPerson } from "react-icons/md";

import { CustomDatePicker } from "../DatePicker";
import { UserAvatar } from "../user/UserAvatar";
import { ButtonWithLoader } from "../ButtonWithLoader";

import {
  DEFAULT_WISHLIST_COLOR,
  DEFAULT_WISHLIST_EMOJI,
  getWishlistAccent,
  getWishlistGradient,
  WISHLIST_COLORS,
  WISHLIST_EMOJIS,
} from "./wishlistAppearance";

import { getFriends } from "@/lib/client-requests/friend";
import { createWishList, updateWishlist } from "@/lib/client-requests/wishlist";
import { dateStringToCalendarDate } from "@/lib/date";
import { IUser } from "@/lib/models/user";
import { IWishlist, IWishlistSettings, Visible } from "@/lib/models/wishlist";

const visibleItems = [
  { key: "1", label: "Всем по ссылке", icon: <MdOutlinePublic /> },
  { key: "0", label: "Только мне", icon: <MdOutlinePublicOff /> },
  { key: "2", label: "Друзьям", icon: <MdPerson /> },
  { key: "3", label: "Указанным друзьям", icon: <MdPerson /> },
];

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});
const loadRussianEmojis = () => import("emoji-picker-react/data/emojis-ru");

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
    settings: IWishlistSettings;
  }>({
    name: wishlist?.name || "",
    description: wishlist?.description || "",
    date: wishlist?.date || null,
    visible: wishlist?.visible ?? Visible.Public,
    uuid: wishlist?.uuid || "",
    visible_user_ids: wishlist?.visible_user_ids || [],
    settings: {
      color: wishlist?.settings?.color || DEFAULT_WISHLIST_COLOR,
      emoji: wishlist?.settings?.emoji || DEFAULT_WISHLIST_EMOJI,
    },
  });
  const [friends, setFriends] = useState<IUser[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const suggestedEmojis = WISHLIST_EMOJIS.slice(0, 10);
  const visibleEmojis = suggestedEmojis.includes(formData.settings.emoji)
    ? suggestedEmojis
    : [...suggestedEmojis, formData.settings.emoji];

  // Уже сохраненная прошедшая дата не должна блокировать редактирование вишлиста
  const initialDate = dateStringToCalendarDate(wishlist?.date || null);
  const todayDate = today(getLocalTimeZone());
  const minEventDate = initialDate
    ? minDate(initialDate, todayDate)
    : todayDate;

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

      <div className="rounded-2xl border border-gray-500/20 p-3">
        <p className="mb-3 text-sm font-medium">Оформление</p>
        <div
          className={`relative mb-4 flex h-20 items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br px-4 ${getWishlistGradient(formData.uuid, formData.settings.color)}`}
        >
          <div className="absolute -right-8 -top-14 size-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-20 size-32 rounded-full bg-black/10" />
          <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/40 dark:bg-white/15 backdrop-blur-sm">
            <span aria-label="Выбранный эмодзи" className="text-3xl" role="img">
              {formData.settings.emoji}
            </span>
          </div>
          <div className="relative z-10 min-w-0">
            {formData.name ? (
              <p className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                {formData.name}
              </p>
            ) : null}
            {formData.description ? (
              <p className="truncate text-sm text-slate-700 dark:text-white/80">
                {formData.description}
              </p>
            ) : null}
          </div>
        </div>
        <span className="mb-2 block text-sm">Цвет</span>
        <div
          aria-label="Цвет обложки"
          className="mb-4 flex flex-wrap gap-3"
          role="group"
        >
          {WISHLIST_COLORS.map((color) => (
            <button
              key={color.id}
              aria-label={color.label}
              aria-pressed={formData.settings.color === color.id}
              className={`size-8 cursor-pointer rounded-full transition ${color.swatch} ${
                formData.settings.color === color.id
                  ? "ring-2 ring-accent ring-offset-2"
                  : "hover:scale-110"
              }`}
              title={color.label}
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  settings: { ...formData.settings, color: color.id },
                })
              }
            />
          ))}
        </div>
        <span className="mb-2 block text-sm">Эмодзи</span>
        <div
          aria-label="Эмодзи вишлиста"
          className="flex flex-wrap gap-2"
          role="group"
        >
          {visibleEmojis.map((emoji) => (
            <button
              key={emoji}
              aria-label={`Эмодзи ${emoji}`}
              aria-pressed={formData.settings.emoji === emoji}
              className={`flex size-10 cursor-pointer items-center justify-center rounded-xl text-2xl transition ${
                formData.settings.emoji === emoji
                  ? "bg-accent/20 ring-2 ring-accent"
                  : "bg-default hover:bg-default/70"
              }`}
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  settings: { ...formData.settings, emoji },
                })
              }
            >
              {emoji}
            </button>
          ))}
          <button
            aria-controls="wishlist-emoji-picker"
            aria-expanded={isEmojiPickerOpen}
            aria-label={
              isEmojiPickerOpen
                ? "Скрыть каталог эмодзи"
                : "Выбрать другой эмодзи"
            }
            className={`flex size-10 cursor-pointer items-center justify-center rounded-xl text-2xl transition ${
              isEmojiPickerOpen
                ? "bg-accent/20 ring-2 ring-accent"
                : "bg-default hover:bg-default/70"
            }`}
            title="Выбрать другой эмодзи"
            type="button"
            onClick={() => setIsEmojiPickerOpen((isOpen) => !isOpen)}
          >
            <span aria-hidden="true">···</span>
          </button>
        </div>
        {isEmojiPickerOpen ? (
          <div
            className="mt-3 overflow-hidden rounded-xl"
            id="wishlist-emoji-picker"
          >
            <EmojiPicker
              lazyLoadEmojis
              autoFocusSearch={false}
              colorScheme={resolvedTheme === "light" ? "light" : "dark"}
              emojiData={loadRussianEmojis}
              height={360}
              labels={{
                loading: "Загрузка эмодзи",
                searchClear: "Очистить поиск",
                searchLabel: "Найти эмодзи",
                searchPlaceholder: "Найти эмодзи",
                searchResultsNone: "Ничего не найдено",
              }}
              previewConfig={{ showPreview: false }}
              width="100%"
              onEmojiClick={(emojiData) => {
                setFormData({
                  ...formData,
                  settings: { ...formData.settings, emoji: emojiData.emoji },
                });
                setIsEmojiPickerOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>

      <CustomDatePicker
        calendarMinValue={todayDate}
        label="Дата события"
        minValue={minEventDate}
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
      <ButtonWithLoader
        fullWidth
        className={getWishlistAccent(formData.uuid, formData.settings.color)}
        isLoading={isCreating}
        loaderText="Сохранение"
        type="submit"
      >
        Сохранить
      </ButtonWithLoader>
    </Form>
  );
}
