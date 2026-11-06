"use client";

import {
  Alert,
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
import { FormEvent, Key, useEffect, useId, useState } from "react";
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

const recipientDescriptions = {
  other:
    "Вы видите занятые подарки без имён гостей и можете бронировать за тех, кто попросил",
  hidden: "Бронирования скрыты от вас, чтобы сохранить сюрприз",
};

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});
const loadRussianEmojis = () => import("emoji-picker-react/data/emojis-ru");
const emojiPickerHeight = 360;

function centerEmojiPicker(element: HTMLDivElement | null) {
  element?.scrollIntoView({
    block: "center",
    inline: "nearest",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
}

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
      for_other: wishlist?.settings?.for_other ?? false,
      color: wishlist?.settings?.color || DEFAULT_WISHLIST_COLOR,
      emoji: wishlist?.settings?.emoji || DEFAULT_WISHLIST_EMOJI,
    },
  });
  const recipientId = useId();
  const recipientDescription = formData.settings.for_other ? "other" : "hidden";
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

      <div
        aria-describedby="wishlist-recipient-description"
        aria-labelledby="wishlist-recipient-title"
        className="w-full rounded-2xl border border-gray-500/20 p-3"
        role="group"
      >
        <p className="mb-3 text-sm font-medium" id="wishlist-recipient-title">
          Для кого вишлист
        </p>
        <div
          className={
            wishlist ? "grid" : "grid grid-cols-1 gap-2 md:grid-cols-2"
          }
        >
          {[
            {
              forOther: false,
              title: "Для себя",
              subtitle: "Сохранить сюрприз",
              emoji: "🎁",
            },
            {
              forOther: true,
              title: "Для другого",
              subtitle: "Для ребёнка или близкого",
              emoji: "👨‍👩‍👧",
            },
          ]
            .filter(
              ({ forOther }) =>
                !wishlist || forOther === formData.settings.for_other,
            )
            .map(({ forOther, title, subtitle, emoji }) => (
              <label
                key={title}
                className="group relative grid min-w-0 cursor-pointer has-disabled:cursor-default grid-cols-[auto_minmax(0,1fr)_auto] content-center gap-x-1.5 rounded-xl border border-default bg-default/40 p-2 has-checked:border-accent has-checked:bg-accent/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent sm:gap-x-3 sm:px-3 sm:py-2.5"
                htmlFor={recipientId + String(forOther)}
              >
                <input
                  checked={formData.settings.for_other === forOther}
                  className="sr-only"
                  disabled={!!wishlist}
                  id={recipientId + String(forOther)}
                  name="wishlist-recipient"
                  type="radio"
                  onChange={() =>
                    setFormData({
                      ...formData,
                      settings: { ...formData.settings, for_other: forOther },
                    })
                  }
                />
                <span
                  aria-hidden="true"
                  className="col-start-1 row-span-2 row-start-1 self-center text-base leading-none sm:text-2xl"
                >
                  {emoji}
                </span>
                <span className="col-start-2 row-start-1 text-sm font-medium">
                  {title}
                </span>
                <span className="col-start-2 row-start-2 text-xs text-muted">
                  {subtitle}
                </span>
                <span
                  aria-hidden="true"
                  className="col-start-3 row-span-2 row-start-1 grid size-3.5 place-items-center self-center rounded-full border border-muted group-has-checked:border-accent group-has-checked:bg-accent sm:size-4"
                >
                  <span className="size-1.5 rounded-full bg-accent-foreground opacity-0 group-has-checked:opacity-100" />
                </span>
              </label>
            ))}
        </div>
        <p
          className="mt-2 text-sm text-muted"
          id="wishlist-recipient-description"
        >
          <span className="grid">
            {Object.entries(recipientDescriptions).map(
              ([mode, description]) => (
                <span
                  key={mode}
                  aria-hidden={mode !== recipientDescription}
                  className={`col-start-1 row-start-1 ${mode === recipientDescription ? "" : "invisible"}`}
                >
                  {description}
                </span>
              ),
            )}
          </span>
        </p>
        {wishlist ? (
          <p className="mt-2 text-xs text-muted">
            Тип вишлиста задан при создании
          </p>
        ) : (
          <Alert className="mt-2 bg-danger-soft" status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>
                После создания тип вишлиста изменить нельзя
              </Alert.Title>
            </Alert.Content>
          </Alert>
        )}
      </div>

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
            ref={centerEmojiPicker}
            className="mt-3 overflow-hidden rounded-xl"
            id="wishlist-emoji-picker"
            style={{ minHeight: emojiPickerHeight }}
          >
            <EmojiPicker
              lazyLoadEmojis
              autoFocusSearch={false}
              colorScheme={resolvedTheme === "light" ? "light" : "dark"}
              emojiData={loadRussianEmojis}
              height={emojiPickerHeight}
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
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    {visible.icon}
                  </span>
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
          fullWidth
          isRequired
          placeholder="Выберите друзей"
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
          <Select.Trigger className="h-auto min-h-9 py-2">
            <Select.Value className="flex min-h-6 min-w-0 items-center">
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
                  <div className="flex min-w-0 flex-wrap gap-1">
                    {selectedItems.map((userId) => {
                      const user = friends.find(
                        (user) => user.id == userId.key,
                      );
                      if (!user) {
                        return null;
                      }
                      return (
                        <Chip key={user.id} className="max-w-full" size="sm">
                          <UserAvatar
                            avatarClassName="size-5"
                            image={user.image}
                            name={user.name}
                            showName={false}
                            size="sm"
                          />
                          <Chip.Label className="truncate">
                            {user.name}
                          </Chip.Label>
                        </Chip>
                      );
                    })}
                  </div>
                );
              }}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="max-h-72 max-w-[calc(100vw-2rem)] overflow-y-auto">
            <ListBox aria-label="Друзья" selectionMode="multiple">
              {friends.map((user) => {
                return (
                  <ListBox.Item
                    key={user.id}
                    id={user.id}
                    textValue={user.name}
                  >
                    <UserAvatar
                      className="min-w-0"
                      description={user.username}
                      image={user.image}
                      name={user.name}
                      nameClassName="block max-w-full truncate text-sm"
                      size="sm"
                    />
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
