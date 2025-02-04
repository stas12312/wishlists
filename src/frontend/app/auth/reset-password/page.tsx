"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { observer } from "mobx-react-lite";
import { redirect, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { Link } from "@heroui/link";

import { checkCode, resetPassword, restorePassword } from "@/lib/requests";
import { ITokens } from "@/lib/models/auth";
import { IRegisterData } from "@/lib/models/auth";
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
      await setTokens(response as ITokens);
      redirect("/");
    }
    setIsLoading(false);
  }

  return (
    <>
      <form
        className="gap-2 flex flex-col bg-content1 rounded-xl box-border shadow-medium p-4"
        id="reset-password"
        onSubmit={handleOnSumbit}
      >
        <h2 className="text-2xl text-center">
          {step == 0
            ? "Восстановление пароля"
            : step == 2
              ? "Новый пароль"
              : "Код подтверждения"}
        </h2>
        {email !== "" && step === 1 ? (
          <span className="text-tiny text-center">
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
                  disabled={isLoading}
                  value={code}
                  onValueChange={setCode}
                />
                <span className="text-danger text-tiny">{codeError}</span>
              </>
            );
          } else if (step == 2) {
            return (
              <PasswordInput
                errorMessage={passwordError}
                isInvalid={passwordError != ""}
                label="Пароль"
                name="new-password"
                value={password}
                onBlur={() => {
                  setPasswordError("");
                }}
                onChange={(e) => setPassword(e.target.value)}
              />
            );
          } else {
            return null;
          }
        })()}
        {[0, 2].includes(step) ? (
          <Button isLoading={isLoading} type="submit">
            {step !== 2 ? "Далее" : "Сменить пароль"}
          </Button>
        ) : null}
      </form>
      <div className="text-center mt-4">
        Вспомнили пароль?{" "}
        <Link className="w" href="/auth/login">
          Войти
        </Link>
      </div>
    </>
  );
});

export default function RestorePasswordPage() {
  return (
    <Suspense>
      <RestorePassword />
    </Suspense>
  );
}
