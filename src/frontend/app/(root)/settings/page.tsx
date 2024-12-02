"use client";

import { Divider } from "@nextui-org/divider";

import { ThemeSwitcher } from "@/components/themeSwitcher";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-2xl">Настройки</p>
      <Divider />
      <ThemeSwitcher />
    </div>
  );
}
