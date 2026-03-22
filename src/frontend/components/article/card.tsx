"use client";
import { observer } from "mobx-react-lite";
import { Button, Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Link } from "@heroui/react";
import Image from "next/image";

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

    return (
      <div className="md:hover:scale-[1.03] duration-200 h-full">
        <Button
          onPress={() => {
            route.push(href);
          }}
        >
          <Card className="w-full h-full">
            <Card.Content className="h-2/3 overflow-hidden p-0 rounded-xl">
              <div className="relative">
                <Image
                  alt="Изображение"
                  className="object-cover mx-auto my-auto w-full h-60"
                  src={article.image}
                />
                <div className="p-2">
                  <h1 className="text-2xl font-bold text-center">
                    {article.title}
                  </h1>
                  <p className="mt-2">{article.description} </p>

                  {forAdmin ? (
                    <div className="flex flex-col absolute top-1 z-10 gap-1 items-center inset-x-0">
                      <Chip color={article.is_published ? "success" : "accent"}>
                        {article.is_published ? "Опубликовано" : "Черновик"}
                      </Chip>
                      {article.created_at ? (
                        <Chip>
                          Создан:{" "}
                          {new Date(article.created_at).toLocaleDateString()}
                        </Chip>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </Card.Content>
            <Card.Footer className="flex justify-between">
              {article.published_at ? (
                <Chip variant="primary">
                  {new Date(article.published_at).toLocaleDateString()}
                </Chip>
              ) : null}

              <Link href={`/blog/${article.slug}`}>Читать далее</Link>
            </Card.Footer>
          </Card>
        </Button>
      </div>
    );
  },
);
