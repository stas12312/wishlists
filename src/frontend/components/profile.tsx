"use client";
import { observer } from "mobx-react-lite";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { MdLink } from "react-icons/md";
import toast from "react-hot-toast";

import PageHeader from "./pageHeader";
import ProfileForm from "./settings/profile";

import { getUserLink } from "@/lib/label";
import userStore from "@/store/userStore";

export const Profile = observer(() => {
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
          <div className="flex gap-2">
            <Input
              isReadOnly
              labelPlacement="outside"
              startContent={<MdLink />}
              value={userStore.user.id ? profileLink : ""}
            />
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
