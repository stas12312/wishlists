import { Metadata } from "next";

import { ArticleDetails } from "@/components/article/details";
import PageHeader from "@/components/pageHeader";
import { getArticleBySlug } from "@/lib/server-requests/article";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const articleSlug = (await params).slug;
  const article = await getArticleBySlug(articleSlug);
  if (!article) {
    return {};
  }
  return {
    title: article.title,
    openGraph: {
      title: article.title,
      description: article.description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const articleSlug = (await params).slug;

  const getData = async () => {
    return await getArticleBySlug(articleSlug);
  };

  const article = await getData();

  if (!article) {
    return (
      <h1 className="text-center w-full text-2xl font-bold">
        Статья не найдена
      </h1>
    );
  }

  return (
    <>
      <PageHeader>
        <p className="text-center mx-auto">{article.title}</p>
      </PageHeader>
      <ArticleDetails article={article} />
    </>
  );
}
