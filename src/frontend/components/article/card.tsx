"use client";
import { observer } from "mobx-react-lite";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { useRouter } from "next/navigation";
import { Link } from "@heroui/link";

import { IArticle } from "@/lib/models/article";
export const ArticleCard = observer(
  ({
    article,
    href,
    withStatus = false,
  }: {
    article: IArticle;
    href: string;
    withStatus?: boolean;
  }) => {
    const route = useRouter();

    return (
      <div className="md:hover:scale-[1.03] duration-200 h-full">
        <Card
          isPressable
          className="w-full h-full"
          onPress={() => {
            route.push(href);
          }}
        >
          <CardBody className="h-2/3 overflow-hidden p-0 rounded-xl">
            <div>
              <Image
                removeWrapper
                className="object-cover mx-auto my-auto w-full h-60"
                src={article.image}
              />
              <div className="p-2">
                <h1 className="text-2xl font-bold text-center">
                  {article.title}
                </h1>
                <p className="mt-2">{article.description} </p>

                {withStatus ? (
                  <Chip>
                    {article.is_published ? "Опубликовано" : "Черновик"}
                  </Chip>
                ) : null}
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex justify-between">
            <Chip>
              {new Date(article.published_at ?? "").toLocaleDateString()}
            </Chip>
            <Link href={`/blog/${article.slug}`}>Читать далее</Link>
          </CardFooter>
        </Card>
      </div>
    );
  },
);
