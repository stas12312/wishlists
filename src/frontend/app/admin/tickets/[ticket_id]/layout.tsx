import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Поддержка",
  openGraph: {
    title: "Поддержка",
    description: "Поддержка",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
