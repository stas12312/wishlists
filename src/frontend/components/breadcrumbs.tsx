"use client";
import { Breadcrumbs, BreadcrumbsItem } from "@heroui/react";
import { useRouter } from "next/navigation";

interface IBreadcrumbItem {
  href: string;
  title: string;
}

export const CustomBreadcrumbs = ({ items }: { items: IBreadcrumbItem[] }) => {
  const router = useRouter();
  return (
    <Breadcrumbs className="justify justify-center md:justify-start">
      {items.map((item, i) => (
        <BreadcrumbsItem
          key={item.title}
          className="*:p-0 p-0"
          onPress={() => {
            router.push(item.href);
          }}
        >
          {i == items.length - 1 ? (
            <h1 className="text-2xl line-clamp-2 whitespace-normal text-center md:text-left">
              {item.title}
            </h1>
          ) : (
            <span className="text-2xl line-clamp-2 whitespace-normal text-center md:text-left">
              {item.title}
            </span>
          )}
        </BreadcrumbsItem>
      ))}
    </Breadcrumbs>
  );
};
