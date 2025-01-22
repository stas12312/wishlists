"use client";

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { observer } from "mobx-react-lite";
import toast from "react-hot-toast";
import { MdLink, MdOutlineExitToApp, MdContentCopy } from "react-icons/md";

import userStore from "@/store/userStore";
import { getUserLink } from "@/lib/label";
import ProfileForm from "@/components/settings/profile";
import PageHeader from "@/components/pageHeader";
import { logout } from "@/lib/auth";

export default function SettingsPage() {
  return <Profile />;
}

const Profile = observer(() => {
  let profileLink = "";
  if (userStore.user.id) {
    profileLink = getUserLink(userStore.user.username);
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:text-center md:text-left ">
        <PageHeader>Настройки</PageHeader>
        <p className="text-xl">Профиль</p>
        <div className="flex flex-col gap-1 rounded-xl bg-content1 box-border shadow-medium p-4 m-1">
          <p className="">Ссылка на профиль</p>
          <div className="flex gap-2 flex-col md:flex-row">
            <Input
              isReadOnly
              className="w-full md:max-w-[60%]"
              labelPlacement="outside"
              startContent={<MdLink />}
              value={userStore.user.id ? profileLink : ""}
            />
            <Button
              className="w-full md:w-[40%]"
              startContent={<MdContentCopy />}
              onPress={() => {
                navigator.clipboard.writeText(profileLink);
                toast.success("Ссылка на профиль скопирована");
              }}
            >
              Скопировать
            </Button>
          </div>
          <p className="font mt-4">Данные профиля</p>
          <ProfileForm />
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
      </div>
    </>
  );
});
