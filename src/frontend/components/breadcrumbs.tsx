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
        list: "justify-center md:justify-start",
      }}
      itemClasses={{
        item: ["text-2xl"],
      }}
    >
      {items.map((item) => (
        <BreadcrumbItem
          key={item.title}
          onPress={() => {
            router.push(item.href);
          }}
        >
          {item.title}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};
