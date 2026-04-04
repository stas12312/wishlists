"use client";
import ArticleForm from "@/components/article/ArticleForm";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <>
      <PageHeader title="Новая статья" />
      <ArticleForm />
    </>
  );
}
