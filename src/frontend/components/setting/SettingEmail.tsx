"use client";

import {
  Button,
  Form,
  InputGroup,
  Label,
  Modal,
  TextField,
  toast,
} from "@heroui/react";
import { observer } from "mobx-react-lite";
import { FormEvent } from "react";

import { ButtonWithLoader } from "../ButtonWithLoader";
import CodeInput from "../CodeInput";

import { useEmailChange } from "./useEmailChange";

import userStore from "@/store/userStore";

export const SettingEmail = observer(() => {
  const form = useEmailChange();

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.secretKey) form.setModalOpen(true);
    else await form.send();
  };
  const confirm = async (event?: FormEvent<HTMLFormElement>, code?: string) => {
    event?.preventDefault();
    if (await form.confirm(code)) toast.success("Email подтверждён и сохранён");
  };

  return (
    <>
      <Form
        className="flex flex-col gap-4"
        validationBehavior="native"
        onSubmit={send}
      >
        <div className="flex flex-col md:flex-row w-full gap-4">
          {userStore.user.email && (
            <TextField
              fullWidth
              isReadOnly
              name="current-email"
              value={userStore.user.email}
              variant="secondary"
            >
              <Label>Текущий email</Label>
              <InputGroup>
                <InputGroup.Input />
              </InputGroup>
            </TextField>
          )}
          <TextField
            fullWidth
            isRequired
            isDisabled={form.busy}
            name="email"
            type="email"
            value={form.email}
            variant="secondary"
            onChange={(value) => form.setEmail(value)}
          >
            <Label>{userStore.user.email ? "Новый email" : "Email"}</Label>
            <InputGroup>
              <InputGroup.Input autoComplete="email" maxLength={254} />
            </InputGroup>
          </TextField>
        </div>
        <ButtonWithLoader
          fullWidth
          isDisabled={!form.secretKey && form.secondsLeft > 0}
          isLoading={form.busy}
          type="submit"
        >
          {userStore.user.email ? "Сменить email" : "Добавить email"}
        </ButtonWithLoader>
        {form.error && !form.modalOpen && (
          <p className="text-danger" role="alert">
            {form.error}
          </p>
        )}
      </Form>
      <Modal.Backdrop
        isDismissable={!form.busy}
        isKeyboardDismissDisabled={form.busy}
        isOpen={form.modalOpen}
        onOpenChange={(open) => form.setModalOpen(open)}
      >
        <Modal.Container size="sm">
          <Modal.Dialog>
            {!form.busy && <Modal.CloseTrigger />}
            <Modal.Header className="items-center">
              <Modal.Heading className="w-full text-center">
                Подтверждение email
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Form
                className="flex flex-col gap-4"
                validationBehavior="native"
                onSubmit={confirm}
              >
                <p className="break-all">Код отправлен на {form.email}</p>
                <CodeInput
                  digitsCount={6}
                  disabled={form.busy || form.attemptsLeft === 0}
                  value={form.code}
                  onValueChange={(value) => {
                    form.setCode(value);
                    if (/^\d{6}$/.test(value)) void confirm(undefined, value);
                  }}
                />
                {form.error && (
                  <p className="text-danger" role="alert">
                    {form.error}
                  </p>
                )}
                {form.busy && form.code.length === 6 && (
                  <p className="text-sm text-muted" role="status">
                    Проверяем код…
                  </p>
                )}
                <Button
                  fullWidth
                  isDisabled={form.busy || form.secondsLeft > 0}
                  type="button"
                  variant="secondary"
                  onPress={() => {
                    void form.send();
                  }}
                >
                  {form.secondsLeft > 0
                    ? `Отправить повторно через ${form.secondsLeft} с`
                    : "Отправить код повторно"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
});
