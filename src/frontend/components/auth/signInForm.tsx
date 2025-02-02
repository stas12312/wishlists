"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

import { IOAuthProvider } from "@/lib/models/auth";
import PasswordInput from "@/components/passwordInput";
import { getUser } from "@/app/auth/login/auth";

const SignInForm = ({ providers }: { providers: IOAuthProvider[] }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    const result = await getUser(formData.email, formData.password);
    if ("message" in result) {
      setErrorMessage(result.message);
    } else {
      router.push("/");
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
      className="flex flex-col gap-2 bg-content1 p-4 rounded-xl box-border shadow-medium"
      id="login"
      onSubmit={handleSubmit}
    >
      <h2 className="text-center text-2xl">Войти</h2>
      <div>
        <Input
          fullWidth
          required
          className="text-2xl"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <PasswordInput
          label="Пароль"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        <small>
          <Link className="text-sm" href="/auth/reset-password">
            Забыли пароль?
          </Link>
        </small>
      </div>
      <span className="text-danger text-sm text-center">{errorMessage}</span>
      <div>
        <Button
          fullWidth
          isLoading={isLoading}
          spinnerPlacement="end"
          type="submit"
        >
          Войти
        </Button>
      </div>
      <p className="text-center">
        <Link href="/auth/register">Регистрация</Link>
      </p>
      <span className="grid grid-cols-5 md:grid-cols-4 gap-1">
        <Divider className="my-auto col-span-1" />
        <span className="text-center col-span-3 md:col-span-2">
          или войти с помощью
        </span>
        <Divider className="my-auto col-span-1" />
      </span>

      <div className="flex justify-center">
        {providers.map((provider) => {
          return (
            <div
              key={provider.name}
              className="p-1 rounded-lg hover:bg-foreground-100 transition hover:duration-100"
            >
              <a className="h-10 text-5xl font-bold" href={provider.url}>
                {provider.icon}
              </a>
            </div>
          );
        })}
      </div>
    </form>
  );
};

export default SignInForm;
