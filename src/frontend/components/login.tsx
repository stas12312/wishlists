"use client";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { observer } from "mobx-react-lite";

const Login = observer(() => {
  return (
    <span className="flex flex-row gap-1">
      <Button as={Link} color="primary" href="/auth/login" variant="ghost">
        Войти
      </Button>
      <Button as={Link} color="primary" href="/auth/register" variant="light">
        Регистрация
      </Button>
    </span>
  );
});

export default Login;
