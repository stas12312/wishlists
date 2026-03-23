"use client";
import { observer } from "mobx-react-lite";

import { ResponsiveImage } from "../responsive-image";

import { editorjsParse } from "@/lib/editorjs-parser/parser";
import { IArticle } from "@/lib/models/article";

export const ArticleDetails = observer(({ article }: { article: IArticle }) => {
  if (!article.content) {
    return <p>Статья не заполнена</p>;
  }

  const blocks = editorjsParse(article.content.blocks);
  return (
    <div className="w-full">
      <div className="max-w-200 mx-auto">
        <ResponsiveImage
          alt="Изображение статьи"
          className="mx-auto object-cover w-full rounded-xl"
          src={article.image}
        />
        {blocks.map((block, i) => (
          <div key={i} className="my-3">
            {block}
          </div>
        ))}
      </div>
    </div>
  );
});
