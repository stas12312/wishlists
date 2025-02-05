import { Chip } from "@heroui/chip";

import { IWish } from "@/lib/models/wish";

const WishlistStatus = ({
  wish,
  size = "md",
}: {
  wish: IWish;
  size?: "sm" | "md" | "lg";
}) => {
  return (
    <>
      {wish.fulfilled_at ? (
        <Chip color="primary" size={size}>
          Исполнено {wish.actions.cancel_reserve ? " вами" : null}
        </Chip>
      ) : null}
      {wish.is_reserved && !wish.fulfilled_at ? (
        <Chip color="success" size="lg">
          Забронировано
          {wish.actions.cancel_reserve ? " вами" : null}
        </Chip>
      ) : null}
    </>
  );
};

export default WishlistStatus;
