"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { FormEvent, useEffect, useState } from "react";
import { redirect } from "next/navigation";

import CodeInput from "@/components/codeInput";
import PasswordInput from "@/components/passwordInput";
import { setTokens } from "@/lib/auth";
import { IRegisterData } from "@/lib/models";
import { confirmEmail, register } from "@/lib/requests";

export default function SignIn() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_2: "",
    name: "",
  });

  const [acceptCode, setAcceptCode] = useState("");
  const [formTitle, setFormTitle] = useState("Регистрация");
  const [errorMessages, setErrorMessages] = useState({
    Email: "",
    Password: "",
    Name: "",
    message: "",
    Code: "",
  });

  const [confirmData, setConfirmData] = useState({} as IRegisterData);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await processRegister();
  }

  useEffect(() => {
    if (acceptCode.length == 6) {
      processRegister();
    }
  }, [acceptCode]);

  async function processRegister() {
    setIsLoading(true);
    errorMessages.Email = "";
    errorMessages.Password = "";
    errorMessages.Name = "";
    errorMessages.message = "";
    errorMessages.Code = "";
    setErrorMessages({ ...errorMessages });
    if (step === 0) {
      const confirmEmailData = await register(
        formData.name,
        formData.password,
        formData.email,
      );

      if ("message" in confirmEmailData) {
        setErrorMessages({
          ...errorMessages,
          message: confirmEmailData.message,
        });
        confirmEmailData.fields?.forEach((field) => {
          setErrorMessages({
            ...errorMessages,
            [field.name]: field.message,
          });
        });
      } else {
        setConfirmData(confirmEmailData);
        setStep(1);
        setFormTitle("Подтверждение email");
      }
    }
    if (step === 1) {
      const result = await confirmEmail(
        confirmData.uuid,
        acceptCode,
        confirmData.secret_key,
        undefined,
      );
      setAcceptCode("");
      if ("message" in result) {
        setErrorMessages({ ...errorMessages, Code: result.message });
      } else {
        await setTokens(result);
        redirect("/");
      }
    }
    setIsLoading(false);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form
      className="flex flex-col mx-auto my-10 max-w-md gap-4 bg-content1 p-4 rounded-xl box-border shadow-medium"
      onSubmit={handleSubmit}
    >
      <h2 className="text-center">{formTitle}</h2>

      {step === 0 ? (
        <div className="flex flex-col gap-2">
          <div>
            <Input
              fullWidth
              isRequired
              label="Имя"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Input
              fullWidth
              isRequired
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <PasswordInput
              errorMessage={errorMessages.Password}
              label="Пароль"
              name="password"
              value={formData.password}
              onBlur={() => {
                setErrorMessages({ ...errorMessages, Password: "" });
              }}
              onChange={handleChange}
            />
          </div>
          <span className="text-danger text-tiny">{errorMessages.message}</span>
          <div>
            <Button
              fullWidth
              isLoading={isLoading}
              spinnerPlacement="end"
              type="submit"
            >
              Далее
            </Button>
          </div>
          <Divider className="my-4" />
          <div className="text-center">
            <Link href="/auth/login">Войти</Link>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <p className="text-tiny text-center">
            На {formData.email} было отправлено письмо с кодом подтверждения
          </p>
          <div>
            <CodeInput
              digitsCount={6}
              disabled={isLoading}
              value={acceptCode}
              onValueChange={setAcceptCode}
            />
          </div>
          <span className="text-danger text-tiny">{errorMessages.Code}</span>
          <span className="text-danger text-tiny">{errorMessages.message}</span>
          <Button
            fullWidth
            onPress={() => {
              setStep(0);
              setFormTitle("Регистрация");
              setAcceptCode("");
            }}
          >
            Назад
          </Button>
        </div>
      ) : null}
    </form>
  );
}
