import { INavigation, ListResponse } from "../models";
import { IArticle } from "../models/article";

import { clientAxios } from "./base";

export async function getAdminArticles(
  navigation?: INavigation,
): Promise<ListResponse<IArticle>> {
  const response = await clientAxios.get("/admin/articles", {
    params: {
      count: navigation?.count,
      cursor: navigation?.cursor,
    },
  });
  return response.data;
}

export async function getArticles(
  navigation?: INavigation,
): Promise<ListResponse<IArticle>> {
  const response = await clientAxios.get("/articles", {
    params: {
      count: navigation?.count,
      cursor: navigation?.cursor,
    },
  });
  return response.data;
}

export async function createArticle(article: IArticle) {
  await clientAxios.post("/admin/articles", article);
}

export async function getArticleById(articleId: number): Promise<IArticle> {
  const response = await clientAxios.get(`/admin/articles/${articleId}`);
  return response.data.data;
}

export async function updateArticle(article: IArticle) {
  await clientAxios.post(`/admin/articles/${article.id}`, article);
}

export async function publishArticle(articleId: number) {
  await clientAxios.post(`/admin/articles/${articleId}/publish`);
}

export async function unpublishArticle(articleId: number) {
  await clientAxios.post(`/admin/articles/${articleId}/unpublish`);
}
