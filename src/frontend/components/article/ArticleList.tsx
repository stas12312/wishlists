"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { AnimatedList } from "../animated-list/AnimatedList";
import { InfinityLoader } from "../InfinityLoader";
import { PageSpinner } from "../PageSpinner";

import { ArticleCard } from "./ArticleCard";

import { getArticles } from "@/lib/client-requests/article";
import { INavigation } from "@/lib/models";
import { IArticle } from "@/lib/models/article";

export const ArticlesList = observer(() => {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadedAll, setIsLoadedAll] = useState(false);
  const [navigation, setNavigation] = useState<INavigation>({
    count: 10,
    cursor: [""],
  });
  useEffect(() => {
    async function fetchData() {
      const response = await getArticles(navigation);
      setArticles(response.data);
      setNavigation(response.navigation);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  async function loadData() {
    if (isLoadedAll) {
      return;
    }
    const response = await getArticles(navigation);
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
    <InfinityLoader onLoad={loadData}>
      <AnimatedList
        gridConfig="grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        items={[
          ...articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              href={`/blog/${article.slug}`}
            />
          )),
        ]}
      />
    </InfinityLoader>
  );
});
