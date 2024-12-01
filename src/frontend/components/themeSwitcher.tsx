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
    <div>
      <Switch
        color="success"
        endContent={<MdDarkMode />}
        isSelected={theme == "dark"}
        size="lg"
        startContent={<MdLightMode />}
        onValueChange={(isSelected) => {
          isSelected ? setTheme("dark") : setTheme("light");
        }}
      >
        Темная тема
      </Switch>
    </div>
  );
}
