"use client";
import { Breadcrumbs, BreadcrumbsItem } from "@heroui/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

interface IBreadcrumbItem {
  href: string;
  title: string;
}

export const CustomBreadcrumbs = ({ items }: { items: IBreadcrumbItem[] }) => {
  const router = useRouter();
  const itemClassName = clsx(
    "text-2xl  line-clamp-3 md:line-clamp-1 text-center md:text-left overflow-hidden",
  );
  return (
    <Breadcrumbs className="justify justify-center md:justify-start flex-col md:flex-row">
      {items.map((item, i) => (
        <BreadcrumbsItem
          key={item.title}
          className="*:p-0 p-0 shrink"
          onPress={() => {
            router.push(item.href);
          }}
        >
          {i == items.length - 1 ? (
            <h1 className={itemClassName} title={item.title}>
              {item.title}
            </h1>
          ) : (
            <span className={itemClassName} title={item.title}>
              {item.title}
            </span>
          )}
        </BreadcrumbsItem>
      ))}
    </Breadcrumbs>
  );
};
