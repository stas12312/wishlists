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

const RestorePassword = observer(() => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const searchParams = useSearchParams();

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
    if (step == 0) {
      const response = await restorePassword(email);

      setRestoreData({ ...response, key: "" });
      setStep(1);
    } else if (step == 1) {
      const response = await checkCode(restoreData, code);

      if ("message" in response) {
        setCodeError(response.message);

        return;
      }
      setStep(2);
    } else if (step == 2) {
      const response = await resetPassword(restoreData, password, code);

      if ("message" in response && response.fields?.length) {
        setPasswordError(response.fields[0].message);

        return;
      }
      setTokens(response as ITokens);
    }
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
            <Input
              errorMessage={codeError}
              isInvalid={codeError != ""}
              label="Код подтверждения"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
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

      <Button type="submit">{step !== 2 ? "Далее" : "Сменить пароль"}</Button>
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
