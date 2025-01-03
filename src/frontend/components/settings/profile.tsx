import { IUser } from "@/lib/models";
import { getMe, getUserByUsername, updateUser } from "@/lib/requests";
import userStore from "@/store/userStore";
import { Button } from "@nextui-org/button";
import { Form } from "@nextui-org/form";
import { Input } from "@nextui-org/input";
import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import UploadButton from "../uploadButton";
import { PageSpinner } from "../pageSpinner";

const ProfileForm = observer(() => {
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [errors, setErrors] = useState({ username: "" });
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

  return (
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
  );
});

async function isUsernameIsExists(
  username: string,
  userId: number
): Promise<boolean> {
  const existsUser = await getUserByUsername(username);
  return existsUser.id !== undefined && existsUser.id != userId;
}

export default ProfileForm;

