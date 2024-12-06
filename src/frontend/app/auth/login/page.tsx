"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getUser } from "./auth";

import PasswordInput from "@/components/passwordInput";
export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isLogining, setIsLogining] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLogining(true);
    const result = await getUser(formData.email, formData.password);
    if ("message" in result) {
      setErrorMessage(result.message);
    } else {
      router.push("/");
    }
    setIsLogining(false);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  return (
    <form
      className="mx-auto my-10 max-w-md flex flex-col gap-2 bg-content1 p-4 rounded-xl box-border shadow-medium"
      onSubmit={handleSubmit}
    >
      <h2 className={"text-center"}>Войти</h2>

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
          isLoading={isLogining}
          spinnerPlacement="end"
          type="submit"
        >
          Войти
        </Button>
      </div>
      <Divider className="my-2" />
      <p className="text-center">
        <Link href="/auth/register">Регистрация</Link>
      </p>
    </form>
  );
}
