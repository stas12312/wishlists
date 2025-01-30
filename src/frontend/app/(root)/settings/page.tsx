"use client";

import PageHeader from "@/components/pageHeader";
import SettingItem from "@/components/settings/item";
import SecuritySection from "@/components/settings/security";
import { ProfileSection } from "@/components/settings/profile";
import { DeleteAccountButton, ExitButton } from "@/components/settings/buttons";

export default function SettingsPage() {
  return (
    <>
      <div className="flex flex-col gap-3 sm:text-center md:text-left ">
        <PageHeader>Настройки</PageHeader>
        <SettingItem header="Профиль">
          <ProfileSection />
        </SettingItem>
        <SettingItem header="Безопасность">
          <SecuritySection />
        </SettingItem>
      </div>
      <ExitButton />
      <DeleteAccountButton />
    </>
  );
}
