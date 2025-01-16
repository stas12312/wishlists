import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || ""),
  title: {
    default: siteConfig.name,
    template: `%s`,
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
          <>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "!bg-content1 dark:!text-white !text-base-content",
              }}
            />
          </>
        </Providers>
      </body>
    </html>
  );
}
