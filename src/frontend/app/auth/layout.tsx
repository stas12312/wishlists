import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex items-center w-screen justify-center">
      <div className="w-full max-w-xl p-2">{children}</div>
    </div>
  );
}
