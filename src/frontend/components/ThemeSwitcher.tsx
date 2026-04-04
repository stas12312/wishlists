"use client";

import { Tabs } from "@heroui/react";
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
      <Tabs.ListContainer>
        <Tabs.List>
          <Tabs.Tab id="system">
            Системная
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="light">
            <MdLightMode />
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="dark">
            <MdDarkMode />
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
