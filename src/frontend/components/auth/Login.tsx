"use client";
import { Button } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { usePathname, useRouter } from "next/navigation";
const Login = observer(() => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <span className="flex flex-row gap-1">
      <LoginButton />
      <Button
        variant="tertiary"
        onPress={() => {
          router.push(`/auth/register?ret=${pathname}`);
        }}
      >
        Регистрация
      </Button>
    </span>
  );
});

export default Login;

export const LoginButton = observer(({ className }: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <Button
      className={className}
      variant="primary"
      onPress={() => {
        router.push(`/auth/login?ret=${pathname}`);
      }}
    >
      Войти
    </Button>
  );
});
