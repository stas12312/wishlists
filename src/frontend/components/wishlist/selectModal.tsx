import { Modal, Spinner, ListBox, ListBoxItem } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { getWishlists } from "@/lib/client-requests/wishlist";
import { IWishlist } from "@/lib/models/wishlist";
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
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop variant="blur">
          <Modal.Container className="min-h-32" placement="center" size="lg">
            <Modal.Dialog>
              <Modal.Header className="flex flex-col gap-1 text-center">
                <Modal.Heading>Выберите вишлист</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <WishlistSelector
                  excludeWishlists={excludeWishlists}
                  onSelect={onSelect}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
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
        <ListBoxItem
          key={wishlist.uuid}
          className="p-2 border-default-200 box-border my-0.5 border"
        >
          <p className="text-lg text-ellipsis truncate overflow-hidden">
            {wishlist.name}
          </p>
          <small className="text-tiny text-default-500">
            {wishlist.description}
          </small>
        </ListBoxItem>
      );
    });

    return (
      <>
        <div className="relative">
          {isLoading ? (
            <Spinner className="h-full mt-auto absolute z-20 bg-content1 w-full opacity-80" />
          ) : null}
          <ListBox
            aria-label="Move wish"
            className="text-center"
            disabledKeys={excludeWishlists}
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
          </ListBox>
        </div>
      </>
    );
  },
);

export default SelectWishlistModal;
