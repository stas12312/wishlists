"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { CardsList } from "../cardsList/cardsList";
import { PageSpinner } from "../pageSpinner";

import { ArticleCard } from "./card";

import { getArticles } from "@/lib/client-requests/article";
import { INavigation } from "@/lib/models";
import { IArticle } from "@/lib/models/article";

export const ArticlesList = observer(() => {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [navigation, setNavigation] = useState<INavigation>({
    count: 20,
    cursor: ["0"],
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

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <CardsList
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
  );
});
