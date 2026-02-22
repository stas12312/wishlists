"use client";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";

interface IBreadcrumbItem {
  href: string;
  title: string;
}

export const CustomBreadcrumbs = ({ items }: { items: IBreadcrumbItem[] }) => {
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
        <BreadcrumbItem key={item.title} href={item.href}>
          {item.title}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};
