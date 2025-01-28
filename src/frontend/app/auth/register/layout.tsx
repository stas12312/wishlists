import { Metadata } from "next";

import { getOgImageUrl } from "@/lib/label";

export const metadata: Metadata = {
  title: "Mywishlists - Регистрация",
  openGraph: {
    title: "Mywishlists - Регистрация",
    description:
      "Регистрация в бесплатном сервисе для составления вишлистов - MyWishlists",
    images: [getOgImageUrl("Mywishlists", "Регистрация")],
  },
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Layout;
