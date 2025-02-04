import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer";
import { Image } from "@heroui/image";
import { AiFillGift } from "react-icons/ai";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

import Desirability from "../desirability";

import WishlistStatus from "./wishlistStatus";

import { IWish } from "@/lib/models/wish";
import { getMenuItemsByActions } from "@/lib/wish/menu";

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
    <Drawer isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="text-center">
              <h1 className="text-2xl">{wish.name}</h1>
            </DrawerHeader>

            <DrawerBody className="flex">
              <span className="mx-auto">
                <WishlistStatus wish={wish} />
              </span>
              <span className="text-default-500">{wish.comment}</span>
              <div>
                {wish.image ? (
                  <Image
                    isZoomed
                    className="z-0 object-cover"
                    src={wish.image}
                  />
                ) : (
                  <div className=" bg-default-100 h-64 rounded-large w-full flex">
                    <AiFillGift className="text-8xl mx-auto my-auto" />
                  </div>
                )}
                <div className="flex -my-8 px-2">
                  {wish.desirability && wish.desirability > 1 ? (
                    <Chip>
                      <Desirability onlyRead value={wish.desirability} />
                    </Chip>
                  ) : null}
                  {wish.cost ? (
                    <Chip className="ml-auto mr-0">
                      {wish.cost.toLocaleString() + " ₽"}
                    </Chip>
                  ) : null}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-2">
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
                {menuItems.map((value) => (
                  <Button
                    key={value.key}
                    color={value.color}
                    startContent={<value.icon />}
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
