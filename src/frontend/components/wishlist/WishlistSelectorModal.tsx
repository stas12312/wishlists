import { Modal, Spinner, ListBox } from "@heroui/react";
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
      <Modal.Backdrop
        isOpen={isOpen}
        variant="blur"
        onOpenChange={onOpenChange}
      >
        <Modal.Container className="min-h-32" placement="center" size="lg">
          <Modal.Dialog className="relative px-2 md:px-4">
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
        <ListBox.Item
          key={wishlist.uuid}
          className="p-2 border-gray-600 box-border border flex flex-col rounded-3xl"
          id={wishlist.uuid}
        >
          <p className="text-lg/4 font-bold text-center">{wishlist.name}</p>
          <small className="text-sm/2 text-left">{wishlist.description}</small>
        </ListBox.Item>
      );
    });

    return (
      <>
        {isLoading ? (
          <div className="min-h-20">
            <Spinner className="absolute z-20 top-1/2 left-1/2" />
          </div>
        ) : (
          <div>
            <ListBox
              aria-label="Move wish"
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
        )}
      </>
    );
  },
);

export default SelectWishlistModal;
