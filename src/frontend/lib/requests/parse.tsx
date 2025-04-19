"use server";
import {
  ParseError,
  ParseStartInfo,
  ParseStatus,
  ShopParam,
} from "../models/parse";

import { axiosInstance } from "./base";

export async function parse(url: string): Promise<ParseStartInfo | ParseError> {
  const response = await axiosInstance.post("parse", {
    url: url,
  });

  return response.data;
}

export async function getParseStatus(task_id: string): Promise<ParseStatus> {
  const response = await axiosInstance.get(`parse/${task_id}/status`);
  return response.data;
}

export async function getAvailableParser(): Promise<ShopParam[]> {
  const response = await axiosInstance.get("parse/available");
  return response.data;
}
