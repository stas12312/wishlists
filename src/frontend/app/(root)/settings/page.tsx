"use client";

import userStore from "@/store/userStore";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { observer } from "mobx-react-lite";
import toast from "react-hot-toast";
import { MdLink, MdOutlineContentCopy } from "react-icons/md";

export default function SettingsPage() {
  return <Content />;
}

const Content = observer(() => {
  const user = userStore.user;
  let profileLink = "";
  if (user.id) {
    profileLink = `${window.location.origin}/users/${user.username}`;
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
              value={user.id ? profileLink : ""}
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
        </div>
      </div>
    </>
  );
});
