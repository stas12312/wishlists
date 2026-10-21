"use client";
import { Form, Input, Label, Modal, TextField } from "@heroui/react";
import { useEffect, useRef, useState } from "react";

import { ButtonWithLoader } from "../ButtonWithLoader";

import { parse, getParseStatus } from "@/lib/client-requests/parse";
import { ParseResult } from "@/lib/models/parse";

const FORM_ID = "parse-check-form";
const POLL_INTERVAL = 1500;
// Дольше воркер не парсит: после этого задача считается зависшей
const POLL_TIMEOUT = 120_000;

type CheckState =
  | { type: "idle" }
  | { type: "running"; status: string }
  | { type: "success"; result: ParseResult; seconds: number }
  | { type: "error"; message: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ParseCheckModal = ({
  isOpen,
  onClose,
  onFinish,
}: {
  isOpen: boolean;
  onClose: () => void;
  // Проверка попадает в события и счётчики прокси, поэтому панель надо обновить
  onFinish: () => void;
}) => {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<CheckState>({ type: "idle" });
  // Закрытие окна или новая проверка обрывают опрос предыдущей
  const run = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      run.current++;
      setUrl("");
      setState({ type: "idle" });
    }
  }, [isOpen]);

  async function check() {
    const current = ++run.current;
    const startedAt = Date.now();
    const isActual = () => run.current === current;
    setState({ type: "running", status: "WAITING" });
    try {
      const started = await parse(url.trim());
      if (!("task_id" in started)) {
        setState({ type: "error", message: started.detail });
        return;
      }
      while (isActual()) {
        await sleep(POLL_INTERVAL);
        if (!isActual()) {
          return;
        }
        if (Date.now() - startedAt > POLL_TIMEOUT) {
          setState({
            type: "error",
            message: "Парсинг не завершился за 2 минуты",
          });
          return;
        }
        const status = await getParseStatus(started.task_id);
        if (status.status === "FINISHED") {
          setState({
            type: "success",
            result: status.result,
            seconds: (Date.now() - startedAt) / 1000,
          });
          break;
        }
        if (status.status === "FAILED") {
          setState({
            type: "error",
            message:
              "Парсинг завершился ошибкой, подробности в последних событиях",
          });
          break;
        }
        setState({ type: "running", status: status.status });
      }
    } catch {
      if (isActual()) {
        setState({ type: "error", message: "Сервис парсинга недоступен" });
      }
      return;
    }
    if (isActual()) {
      onFinish();
    }
  }

  const isRunning = state.type === "running";

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <Modal.Container placement="center">
        <Modal.Dialog className="w-full max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Проверка парсера</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <Form
              id={FORM_ID}
              onSubmit={(event) => {
                event.preventDefault();
                check();
              }}
            >
              <TextField
                isRequired
                isDisabled={isRunning}
                name="url"
                type="url"
                value={url}
                variant="secondary"
                onChange={setUrl}
              >
                <Label>Ссылка на товар</Label>
                <Input placeholder="https://www.wildberries.ru/catalog/…" />
              </TextField>
            </Form>

            {state.type === "running" ? (
              <span>
                {state.status === "WAITING"
                  ? "Ожидает воркера"
                  : "Воркер парсит страницу"}
              </span>
            ) : state.type === "success" ? (
              <div className="flex gap-3">
                {state.result.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-xl object-cover"
                    src={state.result.image}
                  />
                ) : null}
                <div className="flex flex-col gap-1">
                  <span className="break-words text-foreground">
                    {state.result.title}
                  </span>
                  <span className="text-lg text-foreground">
                    {state.result.cost} {state.result.currency}
                  </span>
                  <span className="text-sm text-muted">
                    Готово за {state.seconds.toFixed(1)} с
                  </span>
                </div>
              </div>
            ) : state.type === "error" ? (
              <span className="text-danger">{state.message}</span>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <ButtonWithLoader
              form={FORM_ID}
              isLoading={isRunning}
              loaderText="Парсится…"
              type="submit"
            >
              Проверить
            </ButtonWithLoader>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
