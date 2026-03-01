"use client";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { useRouter } from "next/navigation";

interface IBreadcrumbItem {
  href: string;
  title: string;
}

export const CustomBreadcrumbs = ({ items }: { items: IBreadcrumbItem[] }) => {
  const router = useRouter();
  return (
    <Breadcrumbs
      classNames={{
        list: "justify justify-center md:justify-start",
      }}
      itemClasses={{
        item: [
          "text-2xl line-clamp-2 whitespace-normal text-center md:text-left",
        ],
      }}
    >
      {items.map((item, i) => (
        <BreadcrumbItem
          key={item.title}
          title={item.title}
          onPress={() => {
            router.push(item.href);
          }}
        >
          {i == items.length - 1 ? <h1>{item.title}</h1> : item.title}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};
