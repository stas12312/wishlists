"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AddCardButton from "@/components/AddCardButton";
import { AnimatedList } from "@/components/animated-list/AnimatedList";
import PageHeader from "@/components/PageHeader";
import { getAdminArticles } from "@/lib/client-requests/article";
import { IArticle } from "@/lib/models/article";
import { INavigation } from "@/lib/models";
import { ArticleCard } from "@/components/article/ArticleCard";
import { PageSpinner } from "@/components/PageSpinner";
import { InfinityLoader } from "@/components/InfinityLoader";

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
          <AnimatedList
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
