"use client";

import { Button } from "@nextui-org/button";
import { MdOutlineExitToApp } from "react-icons/md";

import userStore from "@/store/userStore";
import PageHeader from "@/components/pageHeader";
import { logout } from "@/lib/auth";
import SettingItem from "@/components/settings/item";
import SecuritySection from "@/components/settings/security";
import { ProfileSection } from "@/components/settings/profile";

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
      <Button
        fullWidth
        color="danger"
        startContent={<MdOutlineExitToApp />}
        variant="light"
        onPress={async () => {
          userStore.logout();
          await logout();
        }}
      >
        Выйти
      </Button>
    </>
  );
}
