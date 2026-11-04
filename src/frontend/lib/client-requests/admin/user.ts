import { AxiosError, AxiosResponse } from "axios";

import { clientAxios } from "../base";

import { IResponse } from "@/lib/models/response";
import {
  IAdminUser,
  IAdminUserDetail,
  IUserLink,
} from "@/lib/models/admin-user";

function checkResponse(response: AxiosResponse) {
  if (response.status >= 400) {
    throw new AxiosError(
      "Ошибка запроса",
      undefined,
      response.config,
      response.request,
      response,
    );
  }
}

export async function getAdminUsers(search: string, before = 0) {
  const response = await clientAxios.get<IResponse<IAdminUser[]>>(
    "/admin/users",
    {
      params: { search, before },
    },
  );
  checkResponse(response);
  return response.data.data;
}

export async function getAdminUser(id: number) {
  const response = await clientAxios.get<IResponse<IAdminUserDetail>>(
    `/admin/users/${id}`,
  );
  checkResponse(response);
  return response.data.data;
}

export async function deleteAdminUserLink(id: number, link: IUserLink) {
  const response = await clientAxios.delete(
    `/admin/users/${id}/links/${encodeURIComponent(link.provider)}`,
    {
      params: { external_id: link.oauth_user_id },
    },
  );
  checkResponse(response);
}
