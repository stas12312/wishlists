import { IError } from "../models";
import { IWishlist } from "../models/wishlist";

import { serverAxios } from "./base";

export async function getWishlist(uuid: string): Promise<IWishlist | IError> {
  const response = await serverAxios.get(`/wishlists/${uuid}`);

  if (response.status != 200) {
    return response.data as IError;
  }

  return response.data.data;
}
