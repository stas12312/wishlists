import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdContentCopy, MdLink } from "react-icons/md";

import UploadButton from "../uploadButton";

import { getUserLink } from "@/lib/label";
import { IUser } from "@/lib/models/user";
import {
  getMe,
  getUserByUsername,
  updateUser,
  uploadFile,
} from "@/lib/requests";
import userStore from "@/store/userStore";
import { checkFile } from "@/lib/file";

const ACCEPTED_FILE_EXTS = ["jpg", "jpeg", "png", "webp"];

const ProfileForm = observer(() => {
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [errors, setErrors] = useState({ username: "", image: "" });
  const [user, setUser] = useState<IUser>({} as IUser);
  const [imageIsLoading, setImageIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setUser(await getMe());
      setIsProfileLoading(false);
    }
    fetchData();
  }, []);

  async function handleFile(file: File) {
    setErrors({ ...errors, image: "" });
    const checkResult = checkFile(file, ACCEPTED_FILE_EXTS);
    if (checkResult) {
      setErrors({ ...errors, image: checkResult });
      return;
    }
    try {
      setImageIsLoading(true);
      const url = await uploadFile(file);
      setUser({ ...user, image: url });
    } catch {
      setErrors({ ...errors, image: "Возникла ошибка" });
    } finally {
      setImageIsLoading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    setIsProfileLoading(true);
    e.preventDefault();

    if (await isUsernameIsExists(user.username, user.id)) {
      setErrors({ ...errors, username: "Имя пользователя занято" });
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

  return (
    <Form
      validationBehavior="native"
      validationErrors={errors}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
        <Input
          isRequired
          label="Имя пользователя"
          name="username"
          startContent="@"
          validate={(value) => {
            if (value.length < 3) {
              return "Имя пользователя должно содержать не менее двух символов";
            }
          }}
          value={user.username}
          onValueChange={(value) => {
            setUser({ ...user, username: value });
          }}
        />
        <Input
          isRequired
          label="Имя"
          name="name"
          validate={(value) => {
            if (value.length < 2) {
              return "Имя должно содержать не менее трех символов";
            }
          }}
          value={user.name}
          onValueChange={(value) => {
            setUser({ ...user, name: value });
          }}
        />
      </div>
      <span className="text-sm">Изображение профиля</span>
      <UploadButton
        accept={ACCEPTED_FILE_EXTS}
        className="h-[100px] w-[120px] object-cover"
        handleFile={handleFile}
        isLoading={imageIsLoading}
        previewUrl={user.image}
      />
      <span className="text-danger text-tiny">{errors.image}</span>
      <Button fullWidth isLoading={isProfileLoading} type="submit">
        Сохранить
      </Button>
    </Form>
  );
});

async function isUsernameIsExists(
  username: string,
  userId: number,
): Promise<boolean> {
  const existsUser = await getUserByUsername(username);
  return existsUser.id !== undefined && existsUser.id != userId;
}

const ProfileLink = observer(() => {
  let profileLink = "";
  if (userStore.user.id) {
    profileLink = getUserLink(userStore.user.username);
  }
  return (
    <>
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
    </>
  );
});

export const ProfileSection = observer(() => {
  return (
    <>
      <ProfileLink />
      <ProfileForm />
    </>
  );
});
