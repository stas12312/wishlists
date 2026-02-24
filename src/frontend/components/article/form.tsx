"use client";
import { Form } from "@heroui/form";
import { Input, Textarea } from "@heroui/input";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { useState } from "react";
import { OutputData } from "@editorjs/editorjs";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

import UploadButton from "../uploadButton";

import { IArticle } from "@/lib/models/article";
import {
  createArticle,
  publishArticle,
  updateArticle,
  unpublishArticle,
} from "@/lib/client-requests/article";
import { uploadFile } from "@/lib/client-requests/file";

const Editor = dynamic(() => import("../editor/editor"), { ssr: false });
const ArticleForm = observer(
  ({
    existsArticle = {
      id: 0,
      title: "",
      description: "",
      is_published: false,
      slug: "",
      image: "",
    },
  }: {
    existsArticle?: IArticle;
  }) => {
    const [article, setArticle] = useState<IArticle>(existsArticle);
    const [editorData, setEditorData] = useState<OutputData>(
      existsArticle.content as OutputData,
    );
    const router = useRouter();

    async function saveArticle() {
      const data = { ...article, content: editorData as OutputData };
      if (article.id) {
        await updateArticle(data);
      } else {
        await createArticle(data);
      }
      router.push("/admin/articles");
    }

    async function publishThisArticle() {
      await updateArticle(article);
      await publishArticle(article.id);
      setArticle({ ...article, is_published: true });
    }

    async function unpublishThisArticle() {
      await unpublishArticle(article.id);
      setArticle({ ...article, is_published: false });
    }

    return (
      <>
        <div className="my-2 flex gap-2">
          <Chip
            className="my-auto"
            color={article.is_published ? "success" : "primary"}
          >
            {article.is_published ? "Опубликовано" : "Черовик"}
          </Chip>
          {article.id && !article.is_published ? (
            <Button onPress={async () => await publishThisArticle()}>
              Опубликовать
            </Button>
          ) : null}
          {article.id && article.is_published ? (
            <Button onPress={async () => await unpublishThisArticle()}>
              Снять с публикации
            </Button>
          ) : null}
        </div>
        <Form className="w-210 flex flex-col" onSubmit={saveArticle}>
          <Input
            isRequired
            label="Название"
            name="title"
            value={article.title}
            onValueChange={(value) => setArticle({ ...article, title: value })}
          />
          <Input
            isRequired
            label="Slug"
            name="slug"
            value={article.slug}
            onValueChange={(value) => setArticle({ ...article, slug: value })}
          />
          <Textarea
            isRequired
            label="Описание"
            name="description"
            value={article.description}
            onValueChange={(value) =>
              setArticle({ ...article, description: value })
            }
          />
          <Editor
            holder="create-article"
            value={editorData}
            onChange={(data: any) => {
              setEditorData(data);
            }}
          />
          <UploadButton
            accept={["png", "jpeg"]}
            className="h-64 bg-default-100  w-64"
            handleFile={async (file) => {
              setArticle({ ...article, image: await uploadFile(file) });
            }}
            previewUrl={article.image}
          />
          <Button onPress={saveArticle}>Сохранить</Button>
        </Form>
      </>
    );
  },
);

export default ArticleForm;
