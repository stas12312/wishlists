"use client";
import type EditorJS from "@editorjs/editorjs";

import {
  Form,
  Input,
  TextField,
  Button,
  Chip,
  Label,
  TextArea,
  Surface,
} from "@heroui/react";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import UploadButton from "../UploadButton";

import { ArticleDetails } from "./ArticleDetail";

import { createArticleSlug } from "@/lib/article-slug";
import { IArticle } from "@/lib/models/article";
import {
  createArticle,
  publishArticle,
  updateArticle,
  unpublishArticle,
} from "@/lib/client-requests/article";
import { uploadFile } from "@/lib/client-requests/file";

const Editor = dynamic(() => import("../editor/Editor"), { ssr: false });
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
    const [hasCustomSlug, setHasCustomSlug] = useState(
      Boolean(existsArticle.slug),
    );
    const [preview, setPreview] = useState<IArticle | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const editorRef = useRef<EditorJS | null>(null);
    const router = useRouter();

    function changeTitle(title: string) {
      setArticle((current) => ({
        ...current,
        title,
        slug:
          current.id || hasCustomSlug ? current.slug : createArticleSlug(title),
      }));
    }

    async function getArticleData() {
      const editor = editorRef.current;

      await editor?.isReady;
      return {
        ...article,
        content: editor ? await editor.save() : article.content,
      };
    }

    async function saveArticle() {
      const data = await getArticleData();
      if (article.id) {
        await updateArticle(data);
      } else {
        await createArticle(data);
      }
      router.push("/admin/articles");
    }

    async function togglePreview() {
      if (preview) {
        setPreview(null);
        return;
      }

      setPreviewError(false);
      setIsPreviewLoading(true);
      try {
        setPreview(await getArticleData());
      } catch {
        setPreviewError(true);
      } finally {
        setIsPreviewLoading(false);
      }
    }

    async function publishThisArticle() {
      const data = await getArticleData();

      await updateArticle(data);
      await publishArticle(article.id);
      setArticle({ ...data, is_published: true });
    }

    async function unpublishThisArticle() {
      await unpublishArticle(article.id);
      setArticle({ ...article, is_published: false });
    }

    return (
      <>
        <div className="my-2 flex flex-wrap items-center gap-2 *:w-66 *:max-w-full *:rounded-full *:leading-5">
          <Chip
            className="h-9 justify-center md:h-8"
            color={article.is_published ? "success" : "accent"}
            size="lg"
          >
            {article.is_published ? "Опубликовано" : "Черовик"}
          </Chip>
          {article.id && !article.is_published ? (
            <Button size="sm" onPress={async () => await publishThisArticle()}>
              Опубликовать
            </Button>
          ) : null}
          {article.id && article.is_published ? (
            <Button
              size="sm"
              onPress={async () => await unpublishThisArticle()}
            >
              Снять с публикации
            </Button>
          ) : null}
          <Button
            isPending={isPreviewLoading}
            size="sm"
            type="button"
            variant="secondary"
            onPress={togglePreview}
          >
            {preview ? "Вернуться к редактированию" : "Предпросмотр"}
          </Button>
        </div>
        {previewError && (
          <p className="my-2 text-danger" role="alert">
            Не удалось открыть предпросмотр. Попробуйте ещё раз.
          </p>
        )}
        {preview && (
          <section
            aria-label="Предпросмотр статьи"
            className="w-full max-w-210"
          >
            {preview.title && (
              <h1 className="mx-auto my-4 max-w-200 text-3xl font-bold">
                {preview.title}
              </h1>
            )}
            <ArticleDetails article={preview} />
          </section>
        )}
        <div hidden={preview !== null}>
          <Form className="w-210 flex flex-col" onSubmit={saveArticle}>
            <TextField
              isRequired
              name="title"
              type="text"
              value={article.title}
              onChange={changeTitle}
            >
              <Label>Название</Label>
              <Input />
            </TextField>
            <TextField
              isRequired
              name="slug"
              type="text"
              value={article.slug}
              onChange={(slug) => {
                setHasCustomSlug(Boolean(slug.trim()));
                setArticle((current) => ({ ...current, slug }));
              }}
            >
              <Label>Slug</Label>
              <Input />
            </TextField>
            <TextField
              isRequired
              value={article.description}
              onChange={(value) =>
                setArticle({ ...article, description: value })
              }
            >
              <Label>Описание</Label>
              <TextArea name="description" />
            </TextField>
            <Surface className="rounded-3xl mt-4">
              <Editor
                editorRef={editorRef}
                holder="create-article"
                value={existsArticle.content}
              />
            </Surface>
            <div className="mt-4 flex">
              <UploadButton
                accept={["png", "jpeg"]}
                className="h-64 bg-default-100 w-64"
                handleFile={async (file) => {
                  const image = await uploadFile(file);

                  setArticle((current) => ({ ...current, image }));
                }}
                previewUrl={article.image}
              />
            </div>

            <Button className="mt-4" onPress={saveArticle}>
              Сохранить
            </Button>
          </Form>
        </div>
      </>
    );
  },
);

export default ArticleForm;
