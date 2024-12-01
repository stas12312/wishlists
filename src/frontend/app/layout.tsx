import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";

import { Providers } from "./providers";

import Menu from "@/components/menu";
import { UserItem } from "@/components/user";
import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";

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
      <head title="Мои желания">
        <meta
          content="width=device-width, initial-scale=1, user-scalable=1, minimum-scale=1, maximum-scale=5"
          name="viewport"
        />
      </head>
      <body
        className={clsx(
          "h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {!isLogin ? (
            children
          ) : (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-full md:col-span-3 lg:col-span-2 py-10 flex-col">
                <div className="mx-auto text-center">
                  <UserItem />
                </div>
                <div className="mt-10">
                  <Menu />
                </div>
              </div>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: "!bg-content1 dark:!text-white !text-base-content",
                }}
              />
              <div className="col-span-full md:col-span-9 lg:col-span-10 py-10 px-2">
                <main>{children}</main>
                <footer className="w-full flex items-center justify-center py-3" />
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
