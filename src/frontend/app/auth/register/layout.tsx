import { Metadata } from "next";

import { getOgImageUrl } from "@/lib/label";

const DESCRIPTION =
  "Регистрация в бесплатном сервисе для составления вишлистов - MyWishlists";

export const metadata: Metadata = {
  title: "Mywishlists - Регистрация",
  description: DESCRIPTION,
  openGraph: {
    title: "Mywishlists - Регистрация",
    description: DESCRIPTION,
    images: [getOgImageUrl("Mywishlists", "Регистрация")],
  },
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Layout;
