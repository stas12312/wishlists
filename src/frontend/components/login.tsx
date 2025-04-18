"use client";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";
const Login = observer(() => {
  const pathname = usePathname();

  return (
    <span className="flex flex-row gap-1">
      <LoginButton />
      <Button
        as={Link}
        color="primary"
        href={`/auth/register?ret=${pathname}`}
        variant="light"
      >
        Регистрация
      </Button>
    </span>
  );
});

export default Login;

export const LoginButton = observer(({ className }: { className?: string }) => {
  const pathname = usePathname();

  return (
    <Button
      as={Link}
      className={className}
      color="primary"
      href={`/auth/login?ret=${pathname}`}
      variant="ghost"
    >
      Войти
    </Button>
  );
});
