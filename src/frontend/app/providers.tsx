"use client";

import { Toast } from "@heroui/react";
import { RouterProvider } from "@react-aria/utils";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";

import { HeaderProvider } from "@/providers/HeaderProviders";
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();
  return (
    <>
      <Toast.Provider className="bottom-30 md:bottom-4" />
      <RouterProvider navigate={router.push}>
        <HeaderProvider>
          <NextThemesProvider attribute="class" defaultTheme="system">
            {children}
          </NextThemesProvider>
        </HeaderProvider>
      </RouterProvider>
    </>
  );
}
