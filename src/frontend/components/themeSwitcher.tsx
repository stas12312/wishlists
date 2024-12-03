"use client";

import { Switch } from "@nextui-org/switch";
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
    <div
      className="text-2xl cursor-pointer hover:opacity-90 my-auto hover:bg-default-200 p-2 rounded-xl"
      onClick={(e) => {
        theme === "dark" ? setTheme("light") : setTheme("dark");
      }}
    >
      {theme == "dark" ? <MdLightMode /> : <MdDarkMode />}
      {/* <Switch
        color="success"
        endContent={}
        isSelected={theme == "dark"}
        size="md"
        startContent={}
        onValueChange={(isSelected) => {
          isSelected ? setTheme("dark") : setTheme("light");
        }}
      ></Switch> */}
    </div>
  );
}
