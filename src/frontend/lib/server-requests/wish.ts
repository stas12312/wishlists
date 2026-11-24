import { serverAxios } from "./base";

import { ListResponse } from "@/lib/models";
import { IQuestion } from "@/lib/models/question";
import { IWish } from "@/lib/models/wish";

export async function getWish(uuid: string): Promise<IWish | null> {
  const response = await serverAxios.get<IWish>(
    `/wishes/${encodeURIComponent(uuid)}`,
  );

  return response.status === 200 ? response.data : null;
}

export async function getWishQuestions(
  uuid: string,
): Promise<IQuestion[] | undefined> {
  const response = await serverAxios.get<ListResponse<IQuestion>>(
    `/wishes/${encodeURIComponent(uuid)}/questions`,
  );

  return response.status === 200 ? (response.data.data ?? []) : undefined;
}
