import { Metadata } from "next";

import { getOgImageUrl } from "@/lib/label";

export const metadata: Metadata = {
  title: "Mywishlists - Вход",
  openGraph: {
    images: [getOgImageUrl("MyWishlists", "Вход")],
    title: "Mywishlists - Вход",
    description:
      "Вход в бесплатный сервис для составления вишлистов - Mywishlists",
  },
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Layout;
