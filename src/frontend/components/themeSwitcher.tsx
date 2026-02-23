"use client";

import { Tab, Tabs } from "@heroui/tabs";
import { useTheme } from "next-themes";
import { Key, useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Tabs
      aria-label="Theme"
      selectedKey={theme}
      onSelectionChange={(key: Key) => {
        setTheme(key.toString());
      }}
    >
      <Tab key="system" title={"Системная"} />
      <Tab key="light" title={<MdLightMode />} />
      <Tab key="dark" title={<MdDarkMode />} />
    </Tabs>
  );
}
