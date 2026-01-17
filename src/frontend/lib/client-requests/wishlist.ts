import { IError, INavigation, ListResponse } from "../models";
import { IWishlist } from "../models/wishlist";

import { clientAxios } from "./base";

import { IWishlistFilter } from "@/components/wishlist/list";

export async function createWishList(wishlist: IWishlist): Promise<IWishlist> {
  const response = await clientAxios.post("/wishlists", wishlist);

  return response.data.data;
}

export async function updateWishlist(wishlist: IWishlist): Promise<IWishlist> {
  const response = await clientAxios.post(
    `/wishlists/${wishlist.uuid}`,
    wishlist,
  );

  return response.data.data;
}

export async function deleteWishlist(wishlistUUID: string) {
  await clientAxios.delete(`/wishlists/${wishlistUUID}`);
}

export async function getWishlist(uuid: string): Promise<IWishlist | IError> {
  const response = await clientAxios.get(`/wishlists/${uuid}`);

  if (response.status != 200) {
    return response.data as IError;
  }

  return response.data.data;
}

export async function getWishlists(
  filter?: IWishlistFilter | null,
  navigation?: INavigation,
): Promise<ListResponse<IWishlist>> {
  const response = await clientAxios.get("/wishlists", {
    params: {
      is_active: !filter?.showArchive,
      user_id: filter?.userId,
      count: navigation?.count,
      cursor: navigation?.cursor,
      username: filter?.username,
    },
  });
  return response.data;
}
export async function restoreWishlist(wishlistUUID: string) {
  await clientAxios.post(`wishlists/${wishlistUUID}/restore`);
}
