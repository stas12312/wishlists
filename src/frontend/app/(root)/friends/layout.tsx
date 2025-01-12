import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Друзья",
  openGraph: {
    title: "Друзья",
    description: "Список друзей",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
