"use client";
import { setTokens } from "@/lib/auth";
import { IRegisterData, ITokens } from "@/lib/models";
import { checkCode, resetPassword, restorePassword } from "@/lib/requests";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { observer } from "mobx-react-lite";
import { FormEvent, FormEventHandler, use, useEffect, useState } from "react";

const RestorePasswordPage = observer(() => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [restoreData, setRestoreData] = useState<IRegisterData>({
    uuid: "",
    secret_key: "",
  });

  useEffect(() => {
    if (code.length == 6) {
      processRestore();
    }
  }, [code]);

  async function handleOnSumbit(e: FormEvent) {
    e.preventDefault();
    processRestore();
  }

  async function processRestore() {
    if (step == 0) {
      const response = await restorePassword(email);
      setRestoreData(response);
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
      {(() => {
        if (step === 0) {
          return (
            <Input
              name="email"
              label="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            ></Input>
          );
        } else if (step === 1) {
          return (
            <Input
              name="code"
              label="Код подтверждения"
              isInvalid={codeError != ""}
              errorMessage={codeError}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            ></Input>
          );
        } else if (step == 2) {
          return (
            <Input
              name="new-password"
              type="password"
              label="Новый пароль"
              isInvalid={passwordError != ""}
              errorMessage={passwordError}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Input>
          );
        } else {
          return null;
        }
      })()}

      <Button type="submit">{step !== 2 ? "Далее" : "Сменить пароль"}</Button>
      <Divider className="my-2" />
      <div className="w-full text-center">
        <Link href="/login" className="w">
          Войти
        </Link>
      </div>
    </form>
  );
});

export default RestorePasswordPage;
