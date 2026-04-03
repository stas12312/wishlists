import { Form, Spinner, toast } from "@heroui/react";
import { FormEvent, useEffect, useState } from "react";

import PasswordInput from "../passwordInput";
import { ButtonWithLoader } from "../button-with-loader";

import { changePassword, getAuthInfo } from "@/lib/client-requests/user";

interface IFormErrors {
  newPassword?: string;
  message?: string;
}

const SecuritySection = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionLoading, setIsSectionLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);
  const [errors, setErrors] = useState<IFormErrors>({});

  useEffect(() => {
    async function fetchData() {
      const authInfo = getAuthInfo();
      setHasPassword((await authInfo).has_password);
      setIsSectionLoading(false);
    }
    fetchData();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();
    const result = await changePassword(oldPassword, newPassword);
    if ("message" in result) {
      setErrors({ ...errors, message: result.message });
      if ("fields" in result) {
        result.fields?.forEach((field) => {
          if (field.name == "NewPassword") {
            setErrors({ ...errors, newPassword: field.message });
          }
        });
      }
    } else {
      setErrors({});
      toast.success("Пароль успешно изменен");
      setOldPassword("");
      setNewPassword("");
      setHasPassword(true);
    }
    setIsLoading(false);
  };

  return (
    <>
      <h3>Смена пароля</h3>
      <Form
        className="flex gap-4"
        id="change-password"
        validationBehavior="native"
        onSubmit={onSubmit}
      >
        {isSectionLoading ? (
          <div className="flex w-full min-h-32">
            <Spinner className="mx-auto" />
          </div>
        ) : (
          <>
            <div className="flex flex-col w-full gap-4">
              <div className="flex flex-col md:flex-row w-full gap-4">
                {hasPassword ? (
                  <PasswordInput
                    isRequired
                    errorMessage={errors.message}
                    label="Текущий пароль"
                    name="old-password"
                    validate={(value) => {
                      if (value === "") {
                        return "Заполните это поле";
                      }
                      return null;
                    }}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                ) : null}
                <PasswordInput
                  isRequired
                  label="Новый пароль"
                  name="new-password"
                  validate={(value) => {
                    if (value === "") {
                      return "Заполните это поле";
                    }
                    if (value.length < 8) {
                      return "Пароль должен содержать минимум 8 символов";
                    }
                    return null;
                  }}
                  value={newPassword}
                  onBlur={() => {
                    setErrors({ ...errors, newPassword: "" });
                  }}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <ButtonWithLoader
                fullWidth
                isLoading={isLoading}
                loaderText="Сохранение"
                type="submit"
              >
                Сменить пароль
              </ButtonWithLoader>
            </div>
          </>
        )}
      </Form>
    </>
  );
};

export default SecuritySection;
