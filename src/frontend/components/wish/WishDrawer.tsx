import { Button, Drawer, Link } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { MdOpenInNew } from "react-icons/md";

import MarketIcon from "../MarketIcon";
import { QuestionList } from "../question/QuestionList";

import { ImageSwiper } from "./WishImageSwiper";

import { IWish } from "@/lib/models/wish";
import { getMenuItemsByActions } from "@/lib/wish/menu";
import userStore from "@/store/userStore";
import { UserChip } from "@/components/user/UserChip";

const WishFullCard = observer(
  ({
    isOpen,
    onOpenChange,
    handeAction,
    wish,
    withUser = false,
  }: {
    isOpen: boolean;
    onOpenChange: { (): void };
    handeAction: { (action: string): void };
    wish: IWish;
    withUser?: boolean;
  }) => {
    const menuItems = getMenuItemsByActions(wish.actions);
    return (
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="max-w-140 w-full">
              <Drawer.Handle />
              <Drawer.CloseTrigger />
              <Drawer.Header className="text-center">
                <Drawer.Heading className="text-2xl">
                  {wish.name}
                </Drawer.Heading>
              </Drawer.Header>

              <Drawer.Body className="flex flex-col gap-4">
                {withUser ? (
                  <div className="mx-auto">
                    <UserChip
                      className="md:hover:scale-[1.03] transition"
                      user={wish.user}
                    />
                  </div>
                ) : null}

                <span className="text-default-500 whitespace-pre-wrap">
                  {wish.comment}
                </span>

                {wish.link ? (
                  <Link
                    className="w-full button button--secondary button--lg no-underline"
                    href={wish.link}
                    target="_blank"
                  >
                    <MarketIcon link={wish.link || ""} />

                    <span className="mx-auto my-2">Перейти в магазин</span>
                    <MdOpenInNew className="my-auto" />
                  </Link>
                ) : null}

                <ImageSwiper wish={wish} />

                <div className="flex flex-col gap-2">
                  {menuItems.map((value) => (
                    <Button
                      key={value.key}
                      className="w-full"
                      variant={value.variant}
                      onPress={() => {
                        handeAction(value.key);
                      }}
                    >
                      <value.icon />
                      {value.getTitleFunc !== undefined
                        ? value.getTitleFunc(wish.actions)
                        : value.title}
                    </Button>
                  ))}
                </div>
                {wish.uuid ? (
                  <QuestionList
                    withTitle
                    wishUUID={wish.uuid}
                    withAskForm={!wish.actions.edit && userStore.user.id > 0}
                  />
                ) : null}
              </Drawer.Body>
              <Drawer.Footer className="flex flex-col">
                {wish.created_at ? (
                  <span className="text-default-500">
                    Добавлено {new Date(wish.created_at).toLocaleString()}
                  </span>
                ) : null}
                <Button fullWidth slot="close">
                  Закрыть
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );
  },
);

export default WishFullCard;
