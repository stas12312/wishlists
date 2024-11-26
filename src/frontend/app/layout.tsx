import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { Providers } from "./providers";

import Menu from "@/components/menu";
import UserItem from "@/components/user";
import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLogin = cookieStore.has("access_token");
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {!isLogin ? (
            children
          ) : (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2 py-10 flex-col">
                <div className="mx-auto text-center">
                  <UserItem />
                </div>
                <div className="mt-10">
                  <Menu />
                </div>
              </div>
              <div className="col-span-10 py-10 px-2">
                <main>{children}</main>
                <footer className="w-full flex items-center justify-center py-3"></footer>
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
