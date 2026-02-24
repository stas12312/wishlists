import { BlockToolData, OutputBlockData } from "@editorjs/editorjs";
import { ReactNode } from "react";
import { Image } from "@heroui/image";
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

function list(data: BlockToolData): ReactNode {
  return (
    <ul className="list-disc pl-8 text-lg">
      {data.items.map((item: any) => (
        <li key={item.content} className="mark py-1">
          {item.content}
        </li>
      ))}
    </ul>
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
      <Image
        removeWrapper
        alt={data.caption}
        className={`mx-auto ${data.stretched ? "w-full" : ""}`}
        src={data.file.url}
      />
      <p className="font-light italic text-center">{data.caption}</p>
    </div>
  );
}
