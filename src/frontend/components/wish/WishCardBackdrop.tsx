import { ResponsiveImage } from "../ResponsiveImage";
import { getWishlistGradient } from "../wishlist/wishlistAppearance";

export const WISH_CARD_CLASS_NAME =
  "relative isolate w-full flex-col gap-0 overflow-hidden p-0 ring-1 ring-gray-500/30";

export function WishCardBackdrop({
  image,
  wishlistUUID,
  color,
}: {
  image?: string;
  wishlistUUID: string;
  color?: string;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {image ? (
        <div className="absolute bottom-1/2 transform-[translateZ(0)]">
          <ResponsiveImage alt="" className="blur-xl" src={image} />
        </div>
      ) : null}
      <div
        className={`wishlist-card-backdrop absolute inset-0 rounded-3xl bg-gradient-to-br opacity-60 backdrop-saturate-200 backdrop-contrast-125 ${getWishlistGradient(wishlistUUID, color)}`}
      />
    </div>
  );
}
