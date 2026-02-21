"use client";
import ArticleForm from "@/components/article/form";
import PageHeader from "@/components/pageHeader";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <PageHeader>Новая статья</PageHeader>
      <ArticleForm />
    </>
  );
}
