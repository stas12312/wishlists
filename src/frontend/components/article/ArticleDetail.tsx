"use client";
import { observer } from "mobx-react-lite";

import { ResponsiveImage } from "../ResponsiveImage";

import { editorjsParse } from "@/lib/editorjs-parser/parser";
import { IArticle } from "@/lib/models/article";

export const ArticleDetails = observer(({ article }: { article: IArticle }) => {
  const blocks = editorjsParse(article.content?.blocks ?? []);
  return (
    <div className="w-full">
      <div className="max-w-200 mx-auto">
        {article.image && (
          <ResponsiveImage
            alt="Изображение статьи"
            className="mx-auto w-full"
            src={article.image}
          />
        )}
        {blocks.length === 0 && <p>Статья не заполнена</p>}
        {blocks.map((block, i) => (
          <div key={i} className="article-block my-3">
            {block}
          </div>
        ))}
      </div>
    </div>
  );
});
