"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AddCardButton from "@/components/addCardButton";
import { CardsList } from "@/components/cardsList/cardsList";
import PageHeader from "@/components/pageHeader";
import { getAdminArticles } from "@/lib/client-requests/article";
import { IArticle } from "@/lib/models/article";
import { INavigation } from "@/lib/models";
import { ArticleCard } from "@/components/article/card";
import { PageSpinner } from "@/components/pageSpinner";
export default function Page() {
  const route = useRouter();

  const [articles, setArticles] = useState<IArticle[]>([]);
  const [navigation, setNavigation] = useState<INavigation>({
    count: 100,
    cursor: ["0"],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getAdminArticles(navigation);
      setArticles(data.data);
      setNavigation(data.navigation);
      setIsLoading(false);
    }
    fetchData();
  }, []);
  if (isLoading) {
    return <PageSpinner />;
  }
  return (
    <>
      <PageHeader title="Статьи" />
      <div className="p-4">
        <CardsList
          items={[
            <AddCardButton
              key="add"
              className="w-full"
              title="Добавить"
              onPress={() => {
                route.push("/admin/articles/create");
              }}
            />,
            ...articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                href={`/admin/articles/${article.id}`}
              />
            )),
          ]}
        />
      </div>
    </>
  );
}
