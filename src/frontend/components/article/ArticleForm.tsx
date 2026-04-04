"use client";
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
import { useState } from "react";
import { OutputData } from "@editorjs/editorjs";
import { useRouter } from "next/navigation";

import UploadButton from "../UploadButton";

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
        </div>
        <Form className="w-210 flex flex-col" onSubmit={saveArticle}>
          <TextField
            isRequired
            name="title"
            type="text"
            value={article.title}
            onChange={(value) => setArticle({ ...article, title: value })}
          >
            <Label>Название</Label>
            <Input />
          </TextField>
          <TextField
            isRequired
            name="slug"
            type="text"
            value={article.slug}
            onChange={(value) => setArticle({ ...article, slug: value })}
          >
            <Label>Slug</Label>
            <Input />
          </TextField>
          <TextField
            isRequired
            value={article.description}
            onChange={(value) => setArticle({ ...article, description: value })}
          >
            <Label>Описание</Label>
            <TextArea name="description" />
          </TextField>
          <Surface className="rounded-3xl mt-4">
            <Editor
              holder="create-article"
              value={editorData}
              onChange={(data: any) => {
                setEditorData(data);
              }}
            />
          </Surface>
          <div className="mt-4 flex">
            <UploadButton
              accept={["png", "jpeg"]}
              className="h-64 bg-default-100 w-64"
              handleFile={async (file) => {
                setArticle({ ...article, image: await uploadFile(file) });
              }}
              previewUrl={article.image}
            />
          </div>

          <Button className="mt-4" onPress={saveArticle}>
            Сохранить
          </Button>
        </Form>
      </>
    );
  },
);

export default ArticleForm;
