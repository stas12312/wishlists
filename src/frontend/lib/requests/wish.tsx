"use server";
import { IError } from "../models";
import { IWish } from "../models/wish";

import { axiosInstance } from "./base";

export async function getWishes(wishlist_uuid: string): Promise<IWish[]> {
  const response = await axiosInstance.get(
    `/wishlists/${wishlist_uuid}/wishes`,
  );

  return response.data.data;
}

export async function createWish(wish: IWish): Promise<IWish | IError> {
  const response = await axiosInstance.post("/wishes", wish);

  if (response.status != 200) {
    return response.data as IError;
  }

  return response.data.data as IWish;
}

export async function deleteWish(wishUUID: string) {
  await axiosInstance.delete(`/wishes/${wishUUID}`);
}

export async function updateWish(wish: IWish): Promise<IWish | IError> {
  const response = await axiosInstance.post(`/wishes/${wish.uuid}`, wish);

  return response.data;
}

export async function reserveWish(wishUUID: string): Promise<IError | void> {
  const response = await axiosInstance.post(`wishes/${wishUUID}/reserve`);
  if (response.status != 200) {
    return response.data as IError;
  }
}

export async function cancelReserveWish(
  wishUUID: string,
): Promise<IError | void> {
  const response = await axiosInstance.post(
    `wishes/${wishUUID}/cancel_reserve`,
  );
  if (response.status != 200) {
    return response.data as IError;
  }
}

export async function makeWishFull(wishUUID: string) {
  await axiosInstance.post(`/wishes/${wishUUID}/make_full`);
}

export async function cancelWishFull(wishUUID: string) {
  await axiosInstance.post(`/wishes/${wishUUID}/cancel_full`);
}

export async function moveWish(wishUUID: string, wishlistUUID: string) {
  await axiosInstance.post(`/wishes/${wishUUID}/move`, {
    uuid: wishlistUUID,
  });
}
