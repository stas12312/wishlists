import { Metadata } from "next";

import { ArticlesList } from "@/components/article/ArticleList";
import PageHeader from "@/components/PageHeader";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Блог",
    openGraph: {
      title: "Блог",
    },
  };
}

export default async function Page() {
  return (
    <>
      <PageHeader title="Блог" />
      <ArticlesList />
    </>
  );
}
