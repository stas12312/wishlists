import { Metadata } from "next";
import { ReactNode } from "react";

import { getOgImageUrl } from "@/lib/label";

export const metadata: Metadata = {
  title: "Mywishlists - Сброс пароля",
  openGraph: {
    title: "Mywishlists - Сброс пароля",
    description:
      "Сброс пароля в бесплатном сервисе для составления вишлистов - MyWishlists",
    images: [getOgImageUrl("Mywishlists", "Сброс пароля")],
  },
};

export default async function Layout({ children }: { children: ReactNode }) {
  return children;
}
