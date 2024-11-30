"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
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
  const [isVisible, setIsVisible] = useState(false);

  const onChangeVisible = () => setIsVisible(!isVisible);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLogining(true);
    getUser(formData.email, formData.password).then((user) => {
      if (user.email) {
        router.push("/");
      }
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto my-10 max-w-md flex flex-col gap-2 bg-content1 p-4 rounded-xl box-border shadow-medium"
    >
      <h2 className={"text-center"}>Войти</h2>

      <div>
        <Input
          fullWidth
          label="Email"
          value={formData.email}
          onChange={handleChange}
          name="email"
          className="text-2xl"
          required
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
      <div>
        <Button
          fullWidth
          type="submit"
          spinnerPlacement="end"
          isLoading={isLogining}
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
