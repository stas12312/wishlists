import { Button, Drawer } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { twMerge } from "tailwind-merge";

import { WishCreatedAt, WishDetails } from "./WishDetails";

import { getWishlistAccent } from "@/components/wishlist/wishlistAppearance";
import { IWish } from "@/lib/models/wish";
import { IWishlist } from "@/lib/models/wishlist";

const WishFullCard = observer(
  ({
    isOpen,
    onOpenChange,
    handeAction,
    wish,
    wishlist,
    withUser = false,
    withQuestions = true,
  }: {
    isOpen: boolean;
    onOpenChange: { (): void };
    handeAction: { (action: string): void };
    wish: IWish;
    wishlist?: IWishlist;
    withUser?: boolean;
    withQuestions?: boolean;
  }) => {
    const accentClass = getWishlistAccent(
      wishlist?.uuid ?? wish.wishlist_uuid,
      wishlist?.settings?.color,
    );
    return (
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Content placement="right">
          <Drawer.Dialog className={twMerge("max-w-140 w-full", accentClass)}>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header className="text-center">
              <Drawer.Heading className="text-2xl">{wish.name}</Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body className="flex flex-col gap-4 [scrollbar-gutter:stable]">
              <WishDetails
                wish={wish}
                withQuestions={withQuestions}
                withUser={withUser}
                onAction={handeAction}
              />
            </Drawer.Body>
            <Drawer.Footer className="flex flex-col">
              <WishCreatedAt wish={wish} />
              <Button fullWidth slot="close">
                Закрыть
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    );
  },
);

export default WishFullCard;
