import { IArticle } from "../models/article";

import { serverAxios } from "./base";

export async function getArticleById(articleId: number): Promise<IArticle> {
  const response = await serverAxios.get(`/admin/articles/${articleId}`);
  return response.data.data;
}

export async function getArticleBySlug(articleSlug: string): Promise<IArticle> {
  const response = await serverAxios.get(`/articles/${articleSlug}`);
  return response.data.data;
}
