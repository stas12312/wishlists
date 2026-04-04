"use client";
import {
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Surface,
  TextField,
} from "@heroui/react";
import { observer } from "mobx-react-lite";
import { redirect, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import CodeInput from "@/components/CodeInput";
import PasswordInput from "@/components/PasswordInput";
import { setTokens } from "@/lib/auth";
import {
  checkCode,
  resetPassword,
  restorePassword,
} from "@/lib/client-requests/auth";
import { IRegisterData, ITokens } from "@/lib/models/auth";
import { ButtonWithLoader } from "@/components/ButtonWithLoader";

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

  const ret = searchParams.get("ret") || "/";

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
      redirect(ret);
    }
    setIsLoading(false);
  }

  return (
    <Surface className="rounded-3xl box-border shadow-md p-4">
      <Suspense>
        <Form
          className="gap-2 flex flex-col"
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
                <TextField
                  name="email"
                  value={email}
                  variant="secondary"
                  onChange={setEmail}
                >
                  <Label>Email</Label>
                  <Input />
                  <FieldError />
                </TextField>
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
            <ButtonWithLoader isLoading={isLoading} type="submit">
              {step !== 2 ? "Далее" : "Сменить пароль"}
            </ButtonWithLoader>
          ) : null}
        </Form>
        <div className="text-center mt-4">
          Вспомнили пароль?{" "}
          <Link
            className="text-accent no-underline"
            href={`/auth/login?ret=${ret}`}
          >
            Войти
          </Link>
        </div>
      </Suspense>
    </Surface>
  );
});

export default function RestorePasswordPage() {
  return (
    <Suspense>
      <RestorePassword />
    </Suspense>
  );
}
