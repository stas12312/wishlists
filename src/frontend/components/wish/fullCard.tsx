import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";

import CardImage from "./cardImage";

import { IWish } from "@/lib/models/wish";
import { getMenuItemsByActions } from "@/lib/wish/menu";
import { getUserLink } from "@/lib/label";

const WishFullCard = ({
  isOpen,
  onOpenChange,
  handeAction,
  wish,
}: {
  isOpen: boolean;
  onOpenChange: { (): void };
  handeAction: { (action: string): void };
  wish: IWish;
}) => {
  const menuItems = getMenuItemsByActions(wish.actions);

  return (
    <Drawer isOpen={isOpen} size="xl" onOpenChange={onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="text-center">
              <h1 className="text-2xl">{wish.name}</h1>
            </DrawerHeader>

            <DrawerBody className="flex">
              {wish.user.username ? (
                <div className="mx-auto">
                  <Link
                    className="md:hover:scale-[1.03] transition"
                    href={getUserLink(wish.user.username)}
                  >
                    <Chip avatar={<Avatar src={wish.user.image} />}>
                      {wish.user.name}
                    </Chip>
                  </Link>
                </div>
              ) : null}

              <span className="text-default-500">{wish.comment}</span>
              {wish.link ? (
                <Link
                  isBlock
                  isExternal
                  showAnchorIcon
                  className="w-full"
                  href={wish.link}
                  size="lg"
                >
                  <span className="mx-auto">Перейти в магазин</span>
                </Link>
              ) : null}

              <CardImage iconClassName="h-64" wish={wish} />

              <div className="flex flex-col gap-2">
                {menuItems.map((value) => (
                  <Button
                    key={value.key}
                    color={value.color}
                    startContent={<value.icon />}
                    variant="flat"
                    onPress={() => {
                      handeAction(value.key);
                    }}
                  >
                    {value.title}
                  </Button>
                ))}
              </div>
            </DrawerBody>
            <DrawerFooter className="flex flex-col">
              {wish.created_at ? (
                <span className="text-default-500">
                  Добавлено {new Date(wish.created_at).toLocaleString()}
                </span>
              ) : null}
              <Button fullWidth color="danger" onPress={onClose}>
                Закрыть
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default WishFullCard;
