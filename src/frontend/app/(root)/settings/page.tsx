"use client";

import { PageSpinner } from "@/components/pageSpinner";
import UploadButton from "@/components/uploadButton";
import { IUser } from "@/lib/models";
import { getMe, getUserByUsername, updateUser } from "@/lib/requests";
import userStore from "@/store/userStore";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Form } from "@nextui-org/form";
import { Input } from "@nextui-org/input";
import { observer } from "mobx-react-lite";
import { FormEvent, use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdLink, MdOutlineContentCopy } from "react-icons/md";

export default function SettingsPage() {
  return <Profile />;
}

const Profile = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<IUser>({} as IUser);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "" });
  useEffect(() => {
    async function fetchData() {
      setUser(await getMe());
      setIsLoading(false);
    }
    fetchData();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    setIsProfileLoading(true);

    e.preventDefault();

    if (await isUsernameIsExists(user.username, user.id)) {
      setErrors({ username: "Имя пользователя занято" });
      setIsProfileLoading(false);
      return;
    }

    const updatedUser = await updateUser(user);
    if ("message" in updatedUser) {
      toast.error(updatedUser.message);
    } else {
      setUser(updatedUser);
      userStore.reloadMe();
      toast.success("Профиль обновлен");
    }
    setIsProfileLoading(false);
  }

  let profileLink = "";
  if (user.id) {
    profileLink = `${window.location.origin}/users/${userStore.user.username}`;
  }
  if (isLoading) {
    return <PageSpinner></PageSpinner>;
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
          <p className="font mt-4">Информация</p>
          <Form
            validationBehavior="native"
            onSubmit={onSubmit}
            validationErrors={errors}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
              <Input
                isRequired
                name="username"
                value={user.username}
                onValueChange={(value) => {
                  setUser({ ...user, username: value });
                }}
                label="Имя пользователя"
                validate={(value) => {
                  if (value.length < 3) {
                    return "Имя пользователя должно содержать не менее двух символов";
                  }
                }}
              ></Input>
              <Input
                isRequired
                name="name"
                value={user.name}
                onValueChange={(value) => {
                  setUser({ ...user, name: value });
                }}
                label="Имя"
                validate={(value) => {
                  if (value.length < 2) {
                    return "Имя должно содержать не менее трех символов";
                  }
                }}
              ></Input>
            </div>
            <span className="text-sm">Изображение профиля</span>
            <UploadButton
              previewUrl={user.image}
              accept={["jpg", "jpeg", "png", "webp"]}
              className="h-[100px] w-[120px] object-cover"
              onUpload={(url) => {
                setUser({ ...user, image: url });
              }}
            />
            <Button type="submit" fullWidth isLoading={isProfileLoading}>
              Сохранить
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
});

async function isUsernameIsExists(
  username: string,
  userId: number
): Promise<boolean> {
  const existsUser = await getUserByUsername(username);
  return existsUser.id !== undefined && existsUser.id != userId;
}
