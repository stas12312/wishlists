import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mywishlists - Регистрация",
  openGraph: {
    title: "Mywishlists - Регистрация",
    description:
      "Регистрация в бесплатном сервисе для составления вишлистов - MyWishlists",
  },
};

export const Layout = async ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Layout;
