import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mywishlists - Вход",
  openGraph: {
    title: "Mywishlists - Вход",
    description:
      "Вход в бесплатный сервис для составления вишлистов - Mywishlists",
  },
};

export const Layout = async ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Layout;
