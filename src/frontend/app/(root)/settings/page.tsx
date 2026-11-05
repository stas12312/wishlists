"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import SettingItem from "@/components/setting/SettingItem";
import SecuritySection from "@/components/setting/SettingSecurity";
import { SettingLinks } from "@/components/setting/SettingLinks";
import { ProfileSection } from "@/components/setting/SettingProfile";
import { SettingsLinksStore } from "@/store/settingsLinksStore";
import { SettingEmail } from "@/components/setting/SettingEmail";
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
        <SettingItem header="Email">
          <SettingEmail />
        </SettingItem>
        <SettingItem header="Безопасность">
          <SecuritySection />
        </SettingItem>
        <section
          aria-labelledby="login-methods-heading"
          className="flex flex-col gap-3"
        >
          <h2 className="text-xl" id="login-methods-heading">
            Способы входа
          </h2>
          <SettingLinks store={linksStore} />
        </section>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <ExitButton />
        <DeleteAccountButton />
      </div>
    </>
  );
}
