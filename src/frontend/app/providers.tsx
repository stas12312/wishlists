"use client";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { RouterProvider } from "@react-aria/utils";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useCallback } from "react";
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();

  const [width, setWidth] = React.useState(0);

  const handleWindowResize = useCallback(() => {
    setWidth(window.innerWidth);
  }, []);

  React.useEffect(() => {
    setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

  return (
    <HeroUIProvider>
      <RouterProvider navigate={router.push}>
        <ToastProvider toastOffset={width < 768 ? 80 : 0} />
        <NextThemesProvider attribute="class" defaultTheme="light">
          {children}
        </NextThemesProvider>
      </RouterProvider>
    </HeroUIProvider>
  );
}
