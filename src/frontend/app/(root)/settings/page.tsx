"use client";

import ProfileForm from "@/components/settings/profile";
import { getUserLink } from "@/lib/label";
import { IUser } from "@/lib/models";
import userStore from "@/store/userStore";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdLink } from "react-icons/md";

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
        <p className="text-2xl w-full">Настройки</p>
        <Divider />
        <p className="text-xl">Профиль</p>
        <div className="flex flex-col gap-1 rounded-xl bg-content1 box-border shadow-medium p-4 m-1">
          <p className="">Ссылка на профиль</p>
          <div className="flex gap-2">
            <Input
              labelPlacement="outside"
              value={userStore.user.id ? profileLink : ""}
              isReadOnly
              startContent={<MdLink />}
            ></Input>
            <Button
              color="primary"
              // startContent={<MdOutlineContentCopy />}
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
      </div>
    </>
  );
});
