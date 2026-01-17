import {
  FriendStatus,
  FriendsCounters,
  IError,
  IFriendRequest,
} from "../models";
import { IUser } from "../models/user";
import { clientAxios } from "./base";

export async function getFriendStatus(userId: number): Promise<FriendStatus> {
  const response = await clientAxios.get(`/friends/${userId}/status`);
  return response.data.data;
}

export async function deleteFriend(userId: number) {
  await clientAxios.post("friends/delete", { user_id: userId });
}

export async function getFriendsCounters(): Promise<FriendsCounters> {
  const response = await clientAxios.get("friends/counters");
  return response.data;
}

export async function deleteFriendRequest(
  userId: number,
): Promise<IError | null> {
  const response = await clientAxios.post("friends/requests/delete", {
    user_id: userId,
  });
  if (response.status != 200) {
    return response.data;
  }
  return null;
}
export async function AddFriend(userId: number): Promise<IError | null> {
  const response = await clientAxios.post("friends/add", {
    user_id: userId,
  });
  if (response.status != 200) {
    return response.data;
  }
  return null;
}

export async function getFriends(): Promise<IUser[]> {
  const response = await clientAxios.get(`friends`);
  return response.data.data;
}

export async function getFriendRequests(): Promise<IFriendRequest[]> {
  const response = await clientAxios.get(`friends/requests`);
  return response.data.data;
}

export async function applyFriendRequest(
  userId: number,
): Promise<IError | null> {
  const response = await clientAxios.post("/friends/apply_request", {
    user_id: userId,
  });
  if (response.status != 200) {
    return response.data;
  }
  return null;
}

export async function declineFriendRequest(userId: number) {
  const response = await clientAxios.post("/friends/decline_request", {
    user_id: userId,
  });
  if (response.status != 200) {
    return response.data;
  }
  return null;
}
