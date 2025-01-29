import { Button } from "@nextui-org/button";
import { Form } from "@nextui-org/form";
import { Input } from "@nextui-org/input";
import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdContentCopy, MdLink } from "react-icons/md";

import UploadButton from "../uploadButton";

import { getUserLink } from "@/lib/label";
import { IUser } from "@/lib/models/user";
import { getMe, getUserByUsername, updateUser } from "@/lib/requests";
import userStore from "@/store/userStore";

const ProfileForm = observer(() => {
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [errors, setErrors] = useState({ username: "", image: "" });
  const [user, setUser] = useState<IUser>({} as IUser);

  useEffect(() => {
    async function fetchData() {
      setUser(await getMe());
      setIsProfileLoading(false);
    }
    fetchData();
  }, []);

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
        accept={["jpg", "jpeg", "png", "webp"]}
        className="h-[100px] w-[120px] object-cover"
        previewUrl={user.image}
        onError={(error) => {
          setErrors({ ...errors, image: error });
        }}
        onUpload={(url) => {
          setUser({ ...user, image: url });
        }}
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
