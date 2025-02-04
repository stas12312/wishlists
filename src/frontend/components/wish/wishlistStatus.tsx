import { Chip } from "@heroui/chip";

import { IWish } from "@/lib/models/wish";

const WishlistStatus = ({ wish }: { wish: IWish }) => {
  return (
    <>
      {wish.fulfilled_at ? (
        <Chip color="primary">
          Исполнено {wish.actions.cancel_reserve ? " вами" : null}
        </Chip>
      ) : null}
      {wish.is_reserved && !wish.fulfilled_at ? (
        <Chip color="success">
          Забронировано
          {wish.actions.cancel_reserve ? " вами" : null}
        </Chip>
      ) : null}
    </>
  );
};

export default WishlistStatus;
