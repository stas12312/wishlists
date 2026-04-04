import ArticleForm from "@/components/article/ArticleForm";
import PageHeader from "@/components/PageHeader";
import { getArticleById } from "@/lib/server-requests/article";

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const articleId = (await params).id;

  const article = await getArticleById(articleId);
  return (
    <>
      <PageHeader title="Редактирование статьи" />
      <ArticleForm existsArticle={article} />
    </>
  );
}
