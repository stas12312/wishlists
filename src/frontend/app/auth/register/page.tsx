"use client";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { FormEvent, useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import { Link } from "@nextui-org/link";

import CodeInput from "@/components/codeInput";
import PasswordInput from "@/components/passwordInput";
import { setTokens } from "@/lib/auth";
import { IRegisterData } from "@/lib/models/auth";
import { confirmEmail, register } from "@/lib/requests";

const COUNT_DOWN_DURATION = 1000 * 30 + 500;

export default function SignIn() {
  const timer = useRef<NodeJS.Timeout | undefined>();
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
  const [countDown, setCountDown] = useState(0);
  const [countDownDate, setCountDownDate] = useState<number>(0);
  const [retryIsLoading, setRetryIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await processRegister();
  }

  useEffect(() => {
    if (acceptCode.length == 6) {
      processRegister();
    }
  }, [acceptCode]);

  async function sendDataForRegister() {
    const confirmEmailData = await register(
      formData.name,
      formData.password,
      formData.email,
    );
    if ("message" in confirmEmailData) {
      if (confirmEmailData.code != 112) {
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
        return;
      }
    }
    setStep(1);
    setFormTitle("Подтверждение email");
    let countDownDate = new Date().getTime() + COUNT_DOWN_DURATION;

    if ("message" in confirmEmailData && confirmEmailData.code == 112) {
      countDownDate = new Date().getTime() + parseInt(confirmEmailData.details);
    } else {
      setConfirmData(confirmEmailData as IRegisterData);
    }

    setCountDownDate(countDownDate);
    setCountDown(countDownDate - new Date().getTime());
  }

  async function processRegister() {
    setIsLoading(true);
    errorMessages.Email = "";
    errorMessages.Password = "";
    errorMessages.Name = "";
    errorMessages.message = "";
    errorMessages.Code = "";
    setErrorMessages({ ...errorMessages });
    if (step === 0) {
      await sendDataForRegister();
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

  useEffect(() => {
    if (!countDownDate || countDown < 0) {
      return;
    }
    timer.current = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
      if (countDownDate - new Date().getTime() < 0) {
        clearInterval(timer.current);
        timer.current = undefined;
      }
    }, 500);
    return () => clearInterval(timer.current);
  }, [countDownDate]);

  return (
    <>
      <form
        className="flex flex-col gap-2 bg-content1 p-4 rounded-xl box-border shadow-medium"
        id="register"
        onSubmit={handleSubmit}
      >
        <h2 className="text-center text-2xl">{formTitle}</h2>

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
                isInvalid={errorMessages.Password != ""}
                label="Пароль"
                name="password"
                value={formData.password}
                onBlur={() => {
                  setErrorMessages({ ...errorMessages, Password: "" });
                }}
                onChange={handleChange}
              />
            </div>
            <span className="text-danger text-tiny">
              {errorMessages.message}
            </span>
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
            <span className="text-danger text-tiny">
              {errorMessages.message}
            </span>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                fullWidth
                color="primary"
                isDisabled={countDown >= 0}
                isLoading={retryIsLoading}
                onPress={async () => {
                  setRetryIsLoading(true);
                  await sendDataForRegister();
                  toast.success(
                    `Подтверждение было повторно отправлено на ${formData.email}`,
                  );
                  setRetryIsLoading(false);
                }}
              >
                Отправить письмо повторно{" "}
                {countDown >= 0 ? (
                  <>(Через {Math.floor(countDown / 1000)} сек.)</>
                ) : null}{" "}
              </Button>
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
          </div>
        ) : null}
      </form>
      <div className="text-center mt-4">
        Уже есть аккаунт? <Link href="/auth/login">Войти</Link>
      </div>
    </>
  );
}
