import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Лента",
  openGraph: {
    title: "Лента",
    description: "Лента",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
