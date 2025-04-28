import { Metadata } from "next";

import { getOgImageUrl } from "@/lib/label";

const DESCRIPTION =
  "Вход в бесплатный сервис для составления вишлистов - Mywishlists";

export const metadata: Metadata = {
  title: "Mywishlists - OAuth",
  description: DESCRIPTION,
  openGraph: {
    images: [getOgImageUrl("MyWishlists", "Вход через OAuth")],
    title: "Mywishlists - Вход через OAuth",
    description: DESCRIPTION,
  },
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Layout;
