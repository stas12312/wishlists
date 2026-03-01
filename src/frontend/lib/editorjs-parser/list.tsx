import { ReactNode } from "react";

interface IListMeta {
  counterType?: string;
}

interface IListItem {
  content: string;
  meta: IListMeta;
  items: IListItem[];
}

export function list(data: IListItem): ReactNode {
  const counterStyle = getCounterType(data.meta);
  if (data?.items?.length === 0) {
    return null;
  }
  const items = data.items;
  return (
    <ol className={`pl-8 text-lg ${counterStyle}`}>
      {items.map((item, i: number) => (
        <li key={i} className="mark py-1">
          <span dangerouslySetInnerHTML={{ __html: item.content }} />
          {list({ content: item.content, items: item.items, meta: data.meta })}
        </li>
      ))}
    </ol>
  );
}

function getCounterType(meta?: IListMeta): string {
  return meta && meta.counterType === "numeric" ? "list-nested" : "list-disc";
}
