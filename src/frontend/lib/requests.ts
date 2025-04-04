"use server";

import { axiosInstance } from "./requests/base";
import {
  FriendsCounters,
  FriendStatus,
  IError,
  IFriendRequest,
  INavigation,
  ListResponse,
} from "./models";
import { ITokens } from "./models/auth";
import { IRegisterData } from "./models/auth";
import { IOAuthProvider } from "./models/auth";
import { IUser } from "./models/user";
import { IWish } from "./models/wish";
import { IWishlist } from "./models/wishlist";

import { IWishlistFilter } from "@/components/wishlist/list";

export async function getWishlists(
  filter?: IWishlistFilter | null,
  navigation?: INavigation,
): Promise<ListResponse<IWishlist>> {
  const response = await axiosInstance.get("/wishlists", {
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

export async function getMe(): Promise<IUser> {
  const response = await axiosInstance.get("/user/me");

  return response.data;
}

export async function getWishlist(uuid: string): Promise<IWishlist | IError> {
  const response = await axiosInstance.get(`/wishlists/${uuid}`);

  if (response.status != 200) {
    return response.data as IError;
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

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await axiosInstance.post("/images/upload", form);
  return response.data.image_url ?? "";
}

export async function getOAuthProviders(): Promise<IOAuthProvider[]> {
  const response = await axiosInstance.get("/auth/oauth/providers");
  return response.data.data;
}

export async function OAuth(
  type: string,
  token: string,
): Promise<ITokens | IError> {
  const response = await axiosInstance.post("/auth/oauth", {
    type: type,
    token: token,
  });

  return response.data;
}

export async function restoreWishlist(wishlistUUID: string) {
  await axiosInstance.post(`wishlists/${wishlistUUID}/restore`);
}

export async function getWish(wishUUID: string): Promise<IWish> {
  const response = await axiosInstance.get(`wishes/${wishUUID}`);
  return response.data;
}

export async function getReservedWishes(): Promise<IWish[]> {
  const response = await axiosInstance.get("wishes/reserved");
  return response.data.data;
}

export async function getUserByUsername(username: string): Promise<IUser> {
  const response = await axiosInstance.get(`user/${username}`);
  return response.data;
}

export async function updateUser(user: IUser): Promise<IUser | IError> {
  const response = await axiosInstance.post("user", {
    ...user,
  });
  return response.data;
}

export async function AddFriend(userId: number): Promise<IError | null> {
  const response = await axiosInstance.post("friends/add", {
    user_id: userId,
  });
  if (response.status != 200) {
    return response.data;
  }
  return null;
}

export async function getFriends(): Promise<IUser[]> {
  const response = await axiosInstance.get(`friends`);
  return response.data.data;
}

export async function getFriendRequests(): Promise<IFriendRequest[]> {
  const response = await axiosInstance.get(`friends/requests`);
  return response.data.data;
}

export async function applyFriendRequest(
  userId: number,
): Promise<IError | null> {
  const response = await axiosInstance.post("/friends/apply_request", {
    user_id: userId,
  });
  if (response.status != 200) {
    return response.data;
  }
  return null;
}

export async function declineFriendRequest(userId: number) {
  const response = await axiosInstance.post("/friends/decline_request", {
    user_id: userId,
  });
  if (response.status != 200) {
    return response.data;
  }
  return null;
}

export async function getFriendStatus(userId: number): Promise<FriendStatus> {
  const response = await axiosInstance.get(`/friends/${userId}/status`);
  return response.data.data;
}

export async function deleteFriend(userId: number) {
  await axiosInstance.post("friends/delete", { user_id: userId });
}

export async function getFriendsCounters(): Promise<FriendsCounters> {
  const response = await axiosInstance.get("friends/counters");
  return response.data;
}

export async function deleteFriendRequest(
  userId: number,
): Promise<IError | null> {
  const response = await axiosInstance.post("friends/requests/delete", {
    user_id: userId,
  });
  if (response.status != 200) {
    return response.data;
  }
  return null;
}
