"use client";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { checkCode, resetPassword, restorePassword } from "@/lib/requests";
import { IRegisterData, ITokens } from "@/lib/models";
import { setTokens } from "@/lib/auth";
import PasswordInput from "@/components/passwordInput";
import CodeInput from "@/components/codeInput";

const RestorePassword = observer(() => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const [restoreData, setRestoreData] = useState<IRegisterData>({
    uuid: searchParams.get("uuid") ?? "",
    secret_key: "",
    key: searchParams.get("key") ?? "",
  });

  useEffect(() => {
    if (code.length == 6) {
      processRestore();
    }
    if (restoreData.key != "") {
      setStep(2);
    }
  }, [code, restoreData.uuid]);

  async function handleOnSumbit(e: FormEvent) {
    e.preventDefault();
    processRestore();
  }

  async function processRestore() {
    setIsLoading(true);
    if (step == 0) {
      const response = await restorePassword(email);

      setRestoreData({ ...response, key: "" });
      setStep(1);
    } else if (step == 1) {
      const response = await checkCode(restoreData, code);

      if ("message" in response) {
        setCodeError(response.message);
        setIsLoading(false);
        setCode("");
        return;
      }
      setStep(2);
    } else if (step == 2) {
      const response = await resetPassword(restoreData, password, code);

      if ("message" in response && response.fields?.length) {
        setPasswordError(response.fields[0].message);
        setIsLoading(false);
        return;
      }
      setTokens(response as ITokens);
    }
    setIsLoading(false);
  }

  return (
    <form
      className="mx-auto my-10 max-w-md gap-4 flex flex-col bg-content1 p-4 rounded-xl box-border shadow-medium"
      onSubmit={handleOnSumbit}
    >
      <p className="text-lg text-center">
        {step == 0
          ? "Восстановление пароля"
          : step == 2
            ? "Новый пароль"
            : "Код подтверждения"}
      </p>
      {email !== "" && step === 1 ? (
        <span className="text-tiny">
          На {email} было отправлено письмо с кодом подтверждения
        </span>
      ) : null}
      {(() => {
        if (step === 0) {
          return (
            <Input
              label="Email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          );
        } else if (step === 1) {
          return (
            <>
              <CodeInput
                digitsCount={6}
                value={code}
                onValueChange={setCode}
                disabled={isLoading}
              />
              <span className="text-danger text-tiny">{codeError}</span>
            </>
          );
        } else if (step == 2) {
          return (
            <PasswordInput
              errorMessage={passwordError}
              label="Пароль"
              name="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          );
        } else {
          return null;
        }
      })()}

      <Button type="submit" isLoading={isLoading}>
        {step !== 2 ? "Далее" : "Сменить пароль"}
      </Button>
      <Divider className="my-2" />
      <div className="w-full text-center">
        <Link className="w" href="/auth/login">
          Войти
        </Link>
      </div>
    </form>
  );
});

export default function RestorePasswordPage() {
  return (
    <Suspense>
      <RestorePassword />
    </Suspense>
  );
}
