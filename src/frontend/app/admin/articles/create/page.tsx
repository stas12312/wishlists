"use client";
import ArticleForm from "@/components/article/form";
import PageHeader from "@/components/pageHeader";

export default function Page() {
  return (
    <>
      <PageHeader title="Новая статья" />
      <ArticleForm />
    </>
  );
}
