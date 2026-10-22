import { Separator, toast, useOverlayState } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { AiFillGift } from "react-icons/ai";

import { ResponsiveImage } from "../ResponsiveImage";
import WishFullCard from "../wish/WishDrawer";
import { useWishActions } from "../wish/useWishActions";

import { IWish } from "@/lib/models/wish";
import { UserChip } from "@/components/user/UserChip";

export const QuestionWish = observer(
  ({
    wish,
    status,
    actions,
    children,
    onUpdate,
  }: {
    wish: IWish;
    status?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    onUpdate: { (wish: IWish): void };
  }) => {
    const fullCardDrawer = useOverlayState();
    const { handleOnAction, modals } = useWishActions({
      wish,
      onDelete: (_, message) => {
        fullCardDrawer.close();
        toast(message);
      },
      onUpdate,
    });
    const withUser = !wish.actions.edit;

    return (
      <div className="flex flex-col">
        <div className="flex justify-end items-center gap-2 mb-2 empty:hidden md:hidden">
          {status}
          {actions}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="relative size-14 shrink-0 rounded-2xl overflow-hidden bg-default cursor-pointer active:scale-95 transition"
            title="Открыть желание"
            onClick={fullCardDrawer.open}
          >
            {wish.images?.length ? (
              <ResponsiveImage
                fill
                alt="Изображение желания"
                className="size-full rounded-2xl"
                src={wish.images[0]}
              />
            ) : (
              <AiFillGift className="size-7 m-auto h-full" />
            )}
          </button>
          <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
            <button
              className="max-w-full text-left text-lg font-bold truncate cursor-pointer hover:underline"
              onClick={fullCardDrawer.open}
            >
              {wish.name}
            </button>
            {withUser && wish.user?.name ? (
              <UserChip className="whitespace-nowrap" user={wish.user} />
            ) : null}
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0 self-start">
            {status}
            {actions}
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex flex-col gap-2">{children}</div>
        <WishFullCard
          handeAction={handleOnAction}
          isOpen={fullCardDrawer.isOpen}
          wish={wish}
          withQuestions={false}
          withUser={withUser}
          onOpenChange={fullCardDrawer.toggle}
        />
        {modals}
      </div>
    );
  },
);
