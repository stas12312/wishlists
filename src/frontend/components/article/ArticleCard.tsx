"use client";
import { Card, Chip, Link } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { usePress } from "react-aria";

import { ResponsiveImage } from "../ResponsiveImage";

import { IArticle } from "@/lib/models/article";
export const ArticleCard = observer(
  ({
    article,
    href,
    forAdmin = false,
  }: {
    article: IArticle;
    href: string;
    forAdmin?: boolean;
  }) => {
    const route = useRouter();

    const { pressProps, isPressed } = usePress({
      onPress: () => {
        route.push(href);
      },
    });

    return (
      <div className="md:hover:scale-[1.03] transition h-full">
        <Card
          className="w-full h-full data-[pressed=true]:scale-95 transition p-0"
          data-pressed={isPressed ? "true" : undefined}
        >
          <button
            {...pressProps}
            className="card card--primary p-0 h-full  cursor-pointer"
          >
            <Card.Content className="h-2/3 overflow-hidden rounded-xl">
              <div className="relative">
                <ResponsiveImage
                  alt="Изображение"
                  className="object-cover mx-auto my-auto w-full h-60"
                  src={article.image}
                />
                <div className="p-2">
                  <h1 className="text-2xl font-bold text-center">
                    {article.title}
                  </h1>
                  <p className="mt-2 text-sm">{article.description} </p>

                  {forAdmin ? (
                    <div className="flex flex-col absolute top-1 z-10 gap-1 items-center inset-x-0">
                      <Chip
                        color={article.is_published ? "success" : "accent"}
                        size="lg"
                      >
                        {article.is_published ? "Опубликовано" : "Черновик"}
                      </Chip>
                      {article.created_at ? (
                        <Chip size="lg">
                          Создан:{" "}
                          {new Date(article.created_at).toLocaleDateString()}
                        </Chip>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </Card.Content>
            <Card.Footer className="flex justify-between mx-4 mb-2">
              {article.published_at ? (
                <Chip color="accent" size="lg" variant="primary">
                  {new Date(article.published_at).toLocaleDateString()}
                </Chip>
              ) : null}

              <Link
                className="no-underline text-accent hover:text-accent/80 transition"
                href={`/blog/${article.slug}`}
              >
                Читать далее
              </Link>
            </Card.Footer>
          </button>
        </Card>
      </div>
    );
  },
);
