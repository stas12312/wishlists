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
import { InfinityLoader } from "@/components/infinityLoader";

export default function Page() {
  const route = useRouter();

  const [articles, setArticles] = useState<IArticle[]>([]);
  const [navigation, setNavigation] = useState<INavigation>({
    count: 10,
    cursor: [""],
  });
  const [isLoadedAll, setIsLoadedAll] = useState(false);
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

  async function loadData() {
    if (isLoadedAll) {
      return;
    }
    const response = await getAdminArticles(navigation);
    if (response.data.length == 0) {
      setIsLoadedAll(true);
    }
    setArticles([...articles, ...response.data]);
    setNavigation(response.navigation);
  }

  if (isLoading) {
    return <PageSpinner />;
  }
  return (
    <>
      <PageHeader title="Статьи" />
      <InfinityLoader onLoad={loadData}>
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
                  forAdmin
                  article={article}
                  href={`/admin/articles/${article.id}`}
                />
              )),
            ]}
          />
        </div>
      </InfinityLoader>
    </>
  );
}
