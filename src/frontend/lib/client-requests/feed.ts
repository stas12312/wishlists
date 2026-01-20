import { INavigation, ListResponse } from "../models";
import { IWish } from "../models/wish";

import { clientAxios } from "./base";

export async function getFeed(
  navigation: INavigation,
): Promise<ListResponse<IWish>> {
  const response = await clientAxios.get("/feed", {
    params: {
      count: navigation.count,
      cursor: navigation.cursor,
    },
  });
  return response.data;
}
