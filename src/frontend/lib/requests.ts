"use server";
import axios from "axios";
import { cookies } from "next/headers";

import {
  IWishlist,
  IWish,
  IUser,
  IRegisterData,
  ITokens,
  IError,
  IOAuthProvider,
} from "./models";
import { IWishlistFilter } from "@/components/wishlist/list";
import { use } from "react";
import { user } from "@nextui-org/theme";

axios.defaults.baseURL = `${process.env.BASE_URL}/api`;
const axiosInstance = axios.create({});

axiosInstance.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();


  config.headers.Authorization = `Bearer ${cookieStore.get("access_token")?.value}`;

  return config;
});

axiosInstance.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    console.log(error.response.status)
    if (error.response.status == 403) {
    } else if (![400, 404, 500].includes(error.response.status)) {
      return Promise.reject(error);
    }
    return error.response;
  },
);

export async function getWishlists(filter?: IWishlistFilter | null): Promise<IWishlist[]> {
  const response = await axiosInstance.get("/wishlists", {
    params: {
      is_active: !filter?.showArchive,
      user_id: filter?.userId,
    }
  });

  return response.data.data;
}

export async function getWishes(wishlist_uuid: string): Promise<IWish[]> {
  const response = await axiosInstance.get(
    `/wishlists/${wishlist_uuid}/wishes`,
  );

  return response.data.data;
}

export async function getMe(): Promise<IUser> {
  const response = await axiosInstance.get("/user/me");

  return response.data;
}

export async function getWishlist(uuid: string): Promise<IWishlist | IError> {
  const response = await axiosInstance.get(`/wishlists/${uuid}`);

  if (response.status != 200) {
    return response.data as IError
  }

  return response.data.data;
}

export async function register(
  name: string,
  password: string,
  email: string,
): Promise<IRegisterData | IError> {
  const response = await axiosInstance.post("/auth/register", {
    email: email,
    name: name,
    password: password,
  });

  return response.data;
}

export async function confirmEmail(
  uuid: string,
  code?: string,
  secret_key?: string,
  key?: string,
): Promise<ITokens | IError> {
  const response = await axiosInstance.post("/auth/confirm", {
    uuid: uuid,
    code: code,
    key: key,
    secret_key: secret_key,
  });

  return response.data;
}

export async function createWishList(wishlist: IWishlist): Promise<IWishlist> {
  const response = await axiosInstance.post("/wishlists", wishlist);

  return response.data.data;
}

export async function updateWishlist(wishlist: IWishlist): Promise<IWishlist> {
  const response = await axiosInstance.post(
    `/wishlists/${wishlist.uuid}`,
    wishlist,
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

export async function updateWish(wish: IWish): Promise<IWish | IError> {
  const response = await axiosInstance.post(`/wishes/${wish.uuid}`, wish);

  return response.data;
}

export async function deleteWish(wishUUID: string) {
  await axiosInstance.delete(`/wishes/${wishUUID}`);
}

export async function deleteWishlist(wishlistUUID: string) {
  await axiosInstance.delete(`/wishlists/${wishlistUUID}`);
}

export async function authRequest(
  email: string,
  password: string,
): Promise<ITokens> {
  const response = await axiosInstance.post("/auth/login", {
    email: email,
    password: password,
  });

  return response.data;
}

export async function restorePassword(email: string): Promise<IRegisterData> {
  const response = await axiosInstance.post("/auth/restore", {
    email: email,
  });

  return response.data;
}

export async function checkCode(
  registerData: IRegisterData,
  code: string,
): Promise<object | IError> {
  const response = await axiosInstance.post("/auth/check-code/", {
    uuid: registerData.uuid,
    code: code,
    secret_key: registerData.secret_key,
  });

  return response.data;
}

export async function resetPassword(
  registerData: IRegisterData,
  password: string,
  code?: string,
): Promise<ITokens | IError> {
  const response = await axiosInstance.post("/auth/reset-password/", {
    ...registerData,
    code: code,
    password: password,
  });

  return response.data;
}

export async function refreshTokens(
  refreshToken: string,
): Promise<ITokens | IError> {
  const response = await axiosInstance.post("/auth/refresh", {
    refresh_token: refreshToken,
  });

  return response.data;
}

export async function uploadFile(file : File): Promise<string> {
  const form = new FormData();
  form.append("file", file)
  const response = await axiosInstance.post("/images/upload", form)
  console.log(response.data)
  return response.data.image_url ?? ""
}

export async function getOAuthProviders(): Promise<IOAuthProvider[]> {
  const response = await axiosInstance.get("/auth/oauth/providers")
  return response.data.data
}

export async function OAuth(type: string, token: string): Promise<ITokens | IError> {
  const response = await axiosInstance.post("/auth/oauth", {
    type: type,
    token: token,
  })

  return response.data
}

export async function restoreWishlist(wishlistUUID: string) {
  await axiosInstance.post(`wishlists/${wishlistUUID}/restore`)
}

export async function reserveWish(wishUUID: string): Promise<IError | void>{
  const response = await axiosInstance.post(`wishes/${wishUUID}/reserve`)
  if (response.status != 200) {
    return response.data as IError
  }
}

export async function cancelReserveWish(wishUUID: string): Promise<IError | void>{
  const response = await axiosInstance.post(`wishes/${wishUUID}/cancel_reserve`)
  if (response.status != 200) {
    return response.data as IError
  }
}

export async function getWish(wishUUID: string): Promise<IWish> {
  const response = await axiosInstance.get(`wishes/${wishUUID}`)
  return response.data
}

export async function getReservedWishes(): Promise<IWish[]> {
  const response = await axiosInstance.get("wishes/reserved")
  return response.data.data
}

export async function getUserByUsername(username: string): Promise<IUser> {
  const response = await axiosInstance.get(`user/${username}`)
  console.log(response.data)
  return response.data
}