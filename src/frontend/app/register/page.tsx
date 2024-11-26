"use client";
import { setTokens } from "@/lib/auth";
import { IRegisterData } from "@/lib/models";
import { confirmEmail, register } from "@/lib/requests";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function SignIn() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_2: "",
    name: "",
  });

  const [acceptCode, setAcceptCode] = useState("");
  const [formTitle, setFormTitle] = useState("Регистрация");
  async function handleChangeAcceptCode(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setAcceptCode(e.target.value);
  }

  const [isVisible, setIsVisible] = useState(false);

  const onChangeVisible = () => setIsVisible(!isVisible);

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
    processRegister();
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
    if (step === 0) {
      const confirmEmailData = await register(
        formData.name,
        formData.password,
        formData.email
      );

      console.log(errorMessages);
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
        undefined
      );

      if ("message" in result) {
        setErrorMessages({ ...errorMessages, Code: result.message });
      } else {
        setTokens(result);
      }
    }
    setIsLoading(false);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto my-10 max-w-md gap-4">
      <h2 className="text-center">{formTitle}</h2>

      {step === 0 ? (
        <div>
          <div>
            <Input
              fullWidth
              label="Имя"
              value={formData.name}
              onChange={handleChange}
              name="name"
              className={"my-2"}
              isRequired
            />
          </div>
          <div>
            <Input
              fullWidth
              label="Email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              className={"my-2"}
              isRequired
            />
          </div>
          <div>
            <Input
              fullWidth
              label="Пароль"
              type={isVisible ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              name="password"
              className={"my-2"}
              isInvalid={errorMessages.Password !== ""}
              errorMessage={errorMessages.Password}
              isRequired
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={onChangeVisible}
                  aria-label="toggle password visibility"
                >
                  {isVisible ? (
                    <IoMdEyeOff className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <IoMdEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />
          </div>
          <span className="text-danger text-tiny">{errorMessages.message}</span>
          <div>
            <Button
              fullWidth
              type="submit"
              isLoading={isLoading}
              spinnerPlacement="end"
            >
              Далее
            </Button>
          </div>
          <div className="text-center">
            <Link className="my-2" href="/login">
              Войти
            </Link>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <p className="text-tiny text-center">
            На {formData.email} было отправлено письмо с кодом подтверждения
          </p>
          <div>
            <Input
              fullWidth
              label="Код подтверждения"
              type="text"
              value={acceptCode}
              onChange={handleChangeAcceptCode}
              name="code"
              className={"my-2"}
              isInvalid={errorMessages.Code !== ""}
              errorMessage={errorMessages.Code}
            />
          </div>
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
