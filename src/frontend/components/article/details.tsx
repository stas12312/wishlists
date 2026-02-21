"use client";
import { observer } from "mobx-react-lite";
import { Image } from "@heroui/image";

import { IArticle } from "@/lib/models/article";
import { editorjsParse } from "@/lib/editorjs-parser/parser";

export const ArticleDetails = observer(({ article }: { article: IArticle }) => {
  if (!article.content) {
    return <p>Статья не заполнена</p>;
  }

  const blocks = editorjsParse(article.content.blocks);
  return (
    <div className="w-full">
      <div className="max-w-200 mx-auto">
        <Image
          removeWrapper
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
