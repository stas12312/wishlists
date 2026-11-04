"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import SettingItem from "@/components/setting/SettingItem";
import SecuritySection from "@/components/setting/SettingSecurity";
import { SettingLinks } from "@/components/setting/SettingLinks";
import { ProfileSection } from "@/components/setting/SettingProfile";
import { SettingsLinksStore } from "@/store/settingsLinksStore";
import {
  DeleteAccountButton,
  ExitButton,
} from "@/components/setting/SettingsButton";

export default function SettingsPage() {
  const [linksStore] = useState(() => new SettingsLinksStore());
  useEffect(() => {
    void linksStore.load();
  }, [linksStore]);

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
        <SettingItem header="Способы входа">
          <SettingLinks service="yandex" store={linksStore} />
        </SettingItem>
        <SettingItem header="Telegram">
          <SettingLinks service="telegram" store={linksStore} />
        </SettingItem>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <ExitButton />
        <DeleteAccountButton />
      </div>
    </>
  );
}
