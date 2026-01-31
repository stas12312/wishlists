import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Spinner } from "@heroui/spinner";
import { Listbox, ListboxItem } from "@heroui/listbox";

import { IWishlist } from "@/lib/models/wishlist";
import { getWishlists } from "@/lib/client-requests/wishlist";
import userStore from "@/store/userStore";

const SelectWishlistModal = observer(
  ({
    isOpen,
    onOpenChange,
    onSelect,
    excludeWishlists = [],
  }: {
    isOpen: boolean;
    onOpenChange: { (): void };
    onSelect: { (wishlist: IWishlist): Promise<void> };
    excludeWishlists?: string[];
  }) => {
    return (
      <Modal
        backdrop="blur"
        className="min-h-32"
        isOpen={isOpen}
        placement="top-center"
        size="3xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Выберите вишлист
              </ModalHeader>
              <ModalBody>
                <WishlistSelector
                  excludeWishlists={excludeWishlists}
                  onSelect={onSelect}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  },
);

const WishlistSelector = observer(
  ({
    onSelect,
    excludeWishlists = [],
  }: {
    onSelect: {
      (wishlist: IWishlist): Promise<void>;
    };
    excludeWishlists?: string[];
  }) => {
    const [wishlists, setWishlists] = useState<IWishlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      async function fetchData() {
        const data = await getWishlists(
          {
            showArchive: false,
            userId: userStore.user.id,
          },
          {
            count: 100,
            cursor: ["", ""],
          },
        );
        setWishlists(
          data.data.filter((item) => {
            return !excludeWishlists.includes(item.uuid);
          }),
        );
        setIsLoading(false);
      }
      fetchData();
    }, []);

    if (!wishlists) {
    }
    const items = wishlists.map((wishlist) => {
      return (
        <ListboxItem
          key={wishlist.uuid}
          className="p-2 border-default-200 box-border my-0.5 border-1"
        >
          <p className="text-lg text-ellipsis truncate overflow-hidden">
            {wishlist.name}
          </p>
          <small className="text-tiny text-default-500">
            {wishlist.description}
          </small>
        </ListboxItem>
      );
    });

    return (
      <>
        <div className="relative">
          {isLoading ? (
            <Spinner className="h-full mt-auto absolute z-20 bg-content1 w-full opacity-80" />
          ) : null}
          <Listbox
            aria-label="Move wish"
            className="text-center"
            disabledKeys={excludeWishlists}
            emptyContent={<p className="text-center">Вишлистов нет</p>}
            onAction={async (key) => {
              setIsLoading(true);
              await onSelect(
                wishlists.filter((wishlist) => {
                  return wishlist.uuid === key.toString();
                })[0],
              );
              setIsLoading(false);
            }}
          >
            {items}
          </Listbox>
        </div>
      </>
    );
  },
);

export default SelectWishlistModal;
