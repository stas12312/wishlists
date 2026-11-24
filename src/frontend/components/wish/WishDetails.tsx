import type { ReactNode } from "react";

import { Button, Link } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { MdOpenInNew } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import MarketIcon from "../MarketIcon";
import { QuestionList } from "../question/QuestionList";

import { ImageSwiper } from "./WishImageSwiper";

import { IWish } from "@/lib/models/wish";
import { getMenuItemsByActions } from "@/lib/wish/menu";
import userStore from "@/store/userStore";
import { UserChip } from "@/components/user/UserChip";

export const WishDetails = observer(function WishDetails({
  wish,
  onAction,
  withUser = false,
  withQuestions = true,
  afterDescription,
  twoColumns = false,
}: {
  wish: IWish;
  onAction: (action: string) => void;
  withUser?: boolean;
  withQuestions?: boolean;
  afterDescription?: ReactNode;
  twoColumns?: boolean;
}) {
  const menuItems = getMenuItemsByActions(wish);

  return (
    <>
      <div
        className={
          twoColumns
            ? "contents lg:col-start-2 lg:row-start-1 lg:flex lg:min-w-0 lg:flex-col lg:gap-4"
            : "contents"
        }
      >
        {withUser ? (
          <div className="mx-auto">
            <UserChip
              className="md:hover:scale-[1.03] transition"
              user={wish.user}
            />
          </div>
        ) : null}

        <span className="text-default-500 whitespace-pre-wrap wrap-anywhere">
          {wish.comment}
        </span>
        {afterDescription}

        {wish.link ? (
          <Link
            className="w-full button button--secondary button--lg no-underline pl-1"
            href={wish.link}
            target="_blank"
          >
            <MarketIcon link={wish.link || ""} />
            <span className="mx-auto my-2">Перейти в магазин</span>
            <MdOpenInNew className="my-auto" />
          </Link>
        ) : null}
      </div>

      <div
        className={
          twoColumns
            ? "min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1"
            : "contents"
        }
      >
        <ImageSwiper wish={wish} />
      </div>

      <div
        className={twMerge(
          "flex flex-col gap-2",
          twoColumns && "lg:col-start-2 lg:row-start-2",
        )}
      >
        {menuItems.map((value) => (
          <Button
            key={value.key}
            className={twMerge("w-full", value.buttonClassName)}
            variant={value.variant}
            onPress={() => {
              onAction(value.key);
            }}
          >
            <value.icon />
            {value.getTitleFunc !== undefined
              ? value.getTitleFunc(wish.actions)
              : value.title}
          </Button>
        ))}
      </div>
      {withQuestions && wish.uuid ? (
        <div
          className={twMerge(
            "wish-questions empty:hidden",
            twoColumns ? "min-w-0 lg:col-span-2 lg:row-start-3" : "contents",
          )}
        >
          <QuestionList
            withTitle
            wishUUID={wish.uuid}
            withAskForm={!wish.actions.edit && userStore.user.id > 0}
          />
        </div>
      ) : null}
    </>
  );
});

export function WishCreatedAt({ wish }: { wish: IWish }) {
  return wish.created_at ? (
    <span className="text-default-500">
      Добавлено {new Date(wish.created_at).toLocaleString()}
    </span>
  ) : null;
}
