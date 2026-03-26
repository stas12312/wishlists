import {
  Button,
  ErrorMessage,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  TextField,
  toast,
} from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { MdContentCopy, MdLink } from "react-icons/md";

import { CustomDatePicker } from "../datePicker";
import UploadButton from "../uploadButton";

import { uploadFile } from "@/lib/client-requests/file";
import {
  getMe,
  getUserByUsername,
  updateUser,
} from "@/lib/client-requests/user";
import { dateStringToCalendarDate } from "@/lib/date";
import { checkFile } from "@/lib/file";
import { getUserLink } from "@/lib/label";
import { IUser } from "@/lib/models/user";
import userStore from "@/store/userStore";

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
      toast.danger(updatedUser.message);
    } else {
      setUser(updatedUser);
      userStore.reloadMe();
      toast.success("Профиль обновлен");
    }
    setIsProfileLoading(false);
  }

  return (
    <Form
      className="flex flex-col"
      validationBehavior="native"
      validationErrors={errors}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
        <TextField
          isRequired
          name="username"
          validate={(value) => {
            if (value.length < 3) {
              return "Имя пользователя должно содержать не менее двух символов";
            }
          }}
          value={user.username}
          variant="secondary"
          onChange={(value) => {
            setUser({ ...user, username: value });
          }}
        >
          <Label>Имя пользователя</Label>
          <InputGroup>
            <InputGroup.Prefix>@</InputGroup.Prefix>
            <InputGroup.Input />
          </InputGroup>
          <FieldError />
        </TextField>
        <TextField
          isRequired
          name="name"
          validate={(value) => {
            if (value.length < 2) {
              return "Имя должно содержать не менее трех символов";
            }
          }}
          value={user.name}
          variant="secondary"
          onChange={(value) => {
            setUser({ ...user, name: value });
          }}
        >
          <Label>Имя</Label>
          <Input />
          <FieldError />
        </TextField>
        <CustomDatePicker
          label="День рождения"
          maxValue={today(getLocalTimeZone())}
          name="date"
          value={dateStringToCalendarDate(user.birthday || "")}
          variant="secondary"
          onChange={(date) => {
            setUser({ ...user, birthday: date?.toString() });
          }}
        />
      </div>
      <span className="text-sm">Изображение профиля</span>
      <UploadButton
        accept={ACCEPTED_FILE_EXTS}
        className="h-25 w-30 object-cover rounded-3xl"
        handleFile={handleFile}
        isLoading={imageIsLoading}
        previewUrl={user.image}
      />
      <ErrorMessage>{errors.image}</ErrorMessage>
      <Button
        fullWidth
        className="mt-2"
        isPending={isProfileLoading}
        type="submit"
      >
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
        <TextField
          isReadOnly
          className="w-full md:max-w-[60%]"
          variant="secondary"
        >
          <InputGroup>
            <InputGroup.Prefix>
              <MdLink />
            </InputGroup.Prefix>
            <InputGroup.Input value={userStore.user.id ? profileLink : ""} />
          </InputGroup>
        </TextField>
        <Button
          className="w-full md:w-[40%]"
          onPress={() => {
            navigator.clipboard.writeText(profileLink);
            toast("Ссылка на профиль скопирована");
          }}
        >
          <MdContentCopy />
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
