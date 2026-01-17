import { IError } from "../models";
import { IWish } from "../models/wish";

import { clientAxios } from "./base";

export async function getWishes(wishlist_uuid: string): Promise<IWish[]> {
  const response = await clientAxios.get(`/wishlists/${wishlist_uuid}/wishes`);

  return response.data.data;
}

export async function createWish(wish: IWish): Promise<IWish | IError> {
  const response = await clientAxios.post("/wishes", wish);

  if (response.status != 200) {
    return response.data as IError;
  }

  return response.data.data as IWish;
}

export async function deleteWish(wishUUID: string) {
  await clientAxios.delete(`/wishes/${wishUUID}`);
}

export async function updateWish(wish: IWish): Promise<IWish | IError> {
  const response = await clientAxios.post(`/wishes/${wish.uuid}`, wish);

  return response.data;
}

export async function reserveWish(wishUUID: string): Promise<IError | void> {
  const response = await clientAxios.post(`wishes/${wishUUID}/reserve`);
  if (response.status != 200) {
    return response.data as IError;
  }
}

export async function cancelReserveWish(
  wishUUID: string,
): Promise<IError | void> {
  const response = await clientAxios.post(`wishes/${wishUUID}/cancel_reserve`);
  if (response.status != 200) {
    return response.data as IError;
  }
}

export async function makeWishFull(wishUUID: string) {
  await clientAxios.post(`/wishes/${wishUUID}/make_full`);
}

export async function cancelWishFull(wishUUID: string) {
  await clientAxios.post(`/wishes/${wishUUID}/cancel_full`);
}

export async function moveWish(wishUUID: string, wishlistUUID: string) {
  await clientAxios.post(`/wishes/${wishUUID}/move`, {
    uuid: wishlistUUID,
  });
}
export async function getReservedWishes(): Promise<IWish[]> {
  const response = await clientAxios.get("wishes/reserved");
  return response.data.data;
}
export async function getWish(wishUUID: string): Promise<IWish> {
  const response = await clientAxios.get(`wishes/${wishUUID}`);
  return response.data;
}
