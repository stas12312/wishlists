"use client";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getUser } from "./auth";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
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
      className="mx-auto my-10 max-w-md flex flex-col gap-2"
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
        <Input
          fullWidth
          label="Пароль"
          type={isVisible ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          name="password"
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
      <div className="text-center">
        <Link className="my-2" href="/register">
          Регистрация
        </Link>
      </div>
    </form>
  );
}
