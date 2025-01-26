import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mywishlists - Регистрация",
  openGraph: {
    title: "Mywishlists - Регистрация",
    description:
      "Mywishlists - регистрация в бесплатном сервисе для составления вишлиство",
  },
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Layout;
