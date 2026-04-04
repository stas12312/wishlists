"use client";
import {
  Link,
  Button,
  Separator,
  TextField,
  Label,
  Input,
  Surface,
  Form,
  FieldError,
} from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";

import { ButtonWithLoader } from "../ButtonWithLoader";

import { IOAuthProvider } from "@/lib/models/auth";
import PasswordInput from "@/components/PasswordInput";
import { login } from "@/lib/client-requests/auth";
import { authManager } from "@/lib/clientAuth";
import { refreshToken } from "@/lib/auth";

const SignInForm = ({ providers }: { providers: IOAuthProvider[] }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const searchParams = useSearchParams();
  const ret = searchParams.get("ret") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    const result = await login(formData.email, formData.password);
    if ("message" in result) {
      setErrorMessage(result.message);
    } else {
      await refreshToken();
      authManager.accessToken = result.access_token;
      router.push(ret || "/");
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
    <Surface className="rounded-3xl box-border p-4 shadow-md">
      <Form className="flex flex-col gap-2" id="login" onSubmit={handleSubmit}>
        <h2 className="text-center text-2xl">Вход в аккаунт</h2>
        <div>
          <TextField
            fullWidth
            className="text-2xl"
            name="email"
            type="email"
            value={formData.email}
            variant="secondary"
          >
            <Label>Email</Label>
            <Input required onChange={handleChange} />
            <FieldError />
          </TextField>
        </div>
        <div>
          <PasswordInput
            label="Пароль"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <small>
            <Link
              className="text-sm text-accent no-underline"
              href={`/auth/reset-password?ret=${ret}`}
            >
              Забыли пароль?
            </Link>
          </small>
        </div>
        <span className="text-danger text-sm text-center">{errorMessage}</span>
        <div>
          <ButtonWithLoader fullWidth isLoading={isLoading} type="submit">
            Войти
          </ButtonWithLoader>
        </div>
        <span className="grid grid-cols-5 md:grid-cols-4 mt-2">
          <Separator className="my-auto col-span-1" />
          <span className="text-center col-span-3 md:col-span-2">
            или войти с помощью
          </span>
          <Separator className="my-auto col-span-1" />
        </span>

        <div className="flex justify-center">
          {providers.map((provider) => {
            return (
              <div key={provider.name} className="p-1 rounded-full">
                <Button
                  isIconOnly
                  className="p-0"
                  onPress={() => {
                    localStorage.setItem("path", ret || "/");
                    window.open(
                      provider.url,
                      provider.name,
                      "status=no,location=no,toolbar=no,menubar=no,titlebar=no",
                    );
                  }}
                >
                  {provider.icon}
                </Button>
              </div>
            );
          })}
        </div>
      </Form>
      <p className="text-center mt-4">
        Нет аккаунта?{" "}
        <Link
          className="text-accent no-underline"
          href={`/auth/register?ret=${ret}`}
        >
          Зарегистрироваться
        </Link>
      </p>
    </Surface>
  );
};

export default SignInForm;
