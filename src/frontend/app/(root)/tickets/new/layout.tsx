import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Новое обращение",
  openGraph: {
    title: "Новое обращение",
    description: "Новое обращение",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
