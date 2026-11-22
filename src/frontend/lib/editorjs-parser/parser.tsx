import { BlockToolData, OutputBlockData } from "@editorjs/editorjs";
import { ReactNode } from "react";
import clsx from "clsx";

import { list } from "./list";
import { getArticleButtonUrl } from "./button";

import { ResponsiveImage } from "@/components/ResponsiveImage";

export function editorjsParse(blocks: OutputBlockData[]): ReactNode[] {
  let result = [];
  for (let block of blocks) {
    let htmlBlock: ReactNode;

    switch (block.type) {
      case "paragraph":
        htmlBlock = paragraph(block.data);
        break;
      case "list":
        htmlBlock = list(block.data);
        break;
      case "header":
        htmlBlock = header(block.data);
        break;
      case "image":
        htmlBlock = image(block.data);
        break;
      case "button": {
        const { text, url, alignment, fullWidth } = block.data;
        const href = typeof url === "string" && getArticleButtonUrl(url);

        if (!href || typeof text !== "string" || !text.trim()) continue;

        htmlBlock = (
          <div
            className={clsx("flex", {
              "justify-center": alignment === "center",
              "justify-end": alignment === "right",
            })}
          >
            <a
              className={clsx("button button--primary no-underline", {
                "w-full": fullWidth === true,
              })}
              href={href}
            >
              {text}
            </a>
          </div>
        );
        break;
      }
      default:
        throw `Not supported block: ${JSON.stringify(block)}`;
    }
    result.push(htmlBlock);
  }
  return result;
}

function paragraph(data: BlockToolData): ReactNode {
  return (
    <p dangerouslySetInnerHTML={{ __html: data.text }} className="text-lg" />
  );
}

function header(data: BlockToolData): ReactNode {
  const Tag = `h${data.level}`;
  let className;
  switch (data.level) {
    case 1:
      className = "text-3xl";
      break;
    case 2:
      className = "text-2xl";
      break;
  }
  const HeaderTag = Tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <HeaderTag
      className={`${className} font-bold`}
      dangerouslySetInnerHTML={{ __html: data.text }}
    />
  );
}

function image(data: BlockToolData): ReactNode {
  return (
    <div>
      <ResponsiveImage
        alt={data.caption}
        className={
          data.stretched
            ? "mx-auto w-full"
            : "mx-auto w-fit max-w-[min(70%,32rem)]"
        }
        imageClassName={data.stretched ? "w-full" : undefined}
        src={data.file.url}
      />
      <p className="font-light italic text-center">{data.caption}</p>
    </div>
  );
}
