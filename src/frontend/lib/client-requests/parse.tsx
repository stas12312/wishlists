import {
  ParseError,
  ParseStartInfo,
  ParseStatus,
  ShopParam,
} from "../models/parse";

import { clientAxios } from "./base";

export async function parse(url: string): Promise<ParseStartInfo | ParseError> {
  const response = await clientAxios.post("parse", {
    url: url,
  });

  return response.data;
}

export async function getParseStatus(task_id: string): Promise<ParseStatus> {
  const response = await clientAxios.get(`parse/${task_id}/status`);
  return response.data;
}

export async function getAvailableParser(): Promise<ShopParam[]> {
  const response = await clientAxios.get("parse/available");
  return response.data;
}
