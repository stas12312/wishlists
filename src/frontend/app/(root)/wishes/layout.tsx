import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Желания",
  openGraph: {
    title: "Желания",
    description: "Забронированные желания",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
