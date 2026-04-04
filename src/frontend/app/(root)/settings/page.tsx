"use client";

import PageHeader from "@/components/PageHeader";
import SettingItem from "@/components/setting/SettingItem";
import SecuritySection from "@/components/setting/SettingSecurity";
import { ProfileSection } from "@/components/setting/SettingProfile";
import {
  DeleteAccountButton,
  ExitButton,
} from "@/components/setting/SettingsButton";

export default function SettingsPage() {
  return (
    <>
      <PageHeader dividerClassName="mt-2 mb-4" title="Настройки" />
      <div className="flex flex-col gap-3 sm:text-center md:text-left ">
        <SettingItem header="Профиль">
          <ProfileSection />
        </SettingItem>
        <SettingItem header="Безопасность">
          <SecuritySection />
        </SettingItem>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <ExitButton />
        <DeleteAccountButton />
      </div>
    </>
  );
}
