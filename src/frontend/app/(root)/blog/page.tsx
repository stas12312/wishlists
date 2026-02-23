import { Metadata } from "next";

import { ArticlesList } from "@/components/article/list";
import PageHeader from "@/components/pageHeader";

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
