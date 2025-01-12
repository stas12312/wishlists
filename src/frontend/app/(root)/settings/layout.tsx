import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Настройки",
  openGraph: {
    title: "Настройки",
    description: "Настройки",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
