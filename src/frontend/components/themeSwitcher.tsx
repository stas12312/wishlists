"use client";

import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      isIconOnly
      className="text-2xl cursor-pointer hover:opacity-90 my-auto hover:bg-default-200 p-2 rounded-xl bg-none"
      variant="flat"
      onPress={() => {
        theme === "dark" ? setTheme("light") : setTheme("dark");
      }}
    >
      {theme == "dark" ? <MdLightMode /> : <MdDarkMode />}
    </Button>
  );
}
