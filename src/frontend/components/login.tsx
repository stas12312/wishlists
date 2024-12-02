"use client";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { observer } from "mobx-react-lite";

const Login = observer(() => {
  return (
    <span className="flex flex-row gap-1">
      <Button href="/auth/login" as={Link} color="primary" variant="ghost">
        Войти
      </Button>
      <Button href="/auth/register" as={Link} color="primary" variant="light">
        Регистрация
      </Button>
    </span>
  );
});

export default Login;

