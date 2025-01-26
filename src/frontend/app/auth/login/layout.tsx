import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mywishlists - Вход",
  openGraph: {
    title: "Mywishlists - Вход",
    description:
      "Mywishlists - Вход в бесплатный сервис для составления вишлистов",
  },
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Layout;
