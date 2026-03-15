import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вопросы",
  openGraph: {
    title: "Вопросы",
    description: "Вопросы",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
