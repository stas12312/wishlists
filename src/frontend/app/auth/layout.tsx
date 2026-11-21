import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="md:h-[calc(100vh-var(--telegram-top-inset))] flex items-center w-screen justify-center">
      <div className="w-full max-w-xl pt-10 md:pt-0 p-2">{children}</div>
    </div>
  );
}
