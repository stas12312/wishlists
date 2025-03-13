"use client";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { useEffect, useRef, useState, ClipboardEvent } from "react";
import { Alert } from "@heroui/alert";

import MarketIcon from "../marketIcon";

import { parse, getParseStatus } from "@/lib/requests/parse";
import { ParseResult } from "@/lib/models/parse";
import { extractLink, isURL } from "@/lib/url";

const TEXT_BY_STATUS = new Map<string, string>([
  ["FAILES", "Произошла ошибка"],
  ["WATING", "Ожидание загрузки"],
  ["RUNNING", "Загрузка"],
  ["FINISHED", "Загружено"],
]);

const LoadByLinkModal = ({
  onLinkLoad,
  onOpenChange,
  isOpen,
}: {
  onLinkLoad: { (result: ParseResult, link: string): void };
  onOpenChange: { (): void };
  isOpen: boolean;
}) => {
  const [link, setLink] = useState("");
  const timer = useRef<NodeJS.Timeout | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("12341423");
  const [error, setError] = useState("");

  async function parseByUrl(url: string) {
    setError("");
    setIsLoading(true);
    const data = await parse(url);
    if ("detail" in data) {
      setError(data.detail);
      setIsLoading(false);
      return;
    }

    setTaskId(data.task_id);
    await updateStatus(data.task_id);
    timer.current = setInterval(() => {
      updateStatus(data.task_id);
    }, 500);
  }

  async function updateStatus(taskId: string) {
    const status = await getParseStatus(taskId);

    setStatus(status.status);
    if (status.status == "FINISHED") {
      onLinkLoad(status.result, link);
      onOpenChange();
      clearInterval(timer.current);
      setIsLoading(false);
    }
    if (status.status == "FAILED") {
      clearInterval(timer.current);
      setIsLoading(false);
      setError(
        "При загрузке произошла ошибка, проверьте ссылку и попробуйте снова",
      );
    }
  }

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="mx-auto">Загрузка по ссылке</ModalHeader>
            <ModalBody>
              <>
                <Alert
                  color="primary"
                  title={
                    <p>
                      На данный момент поддерживается загрузка из <b>ozon</b> и
                      <b> wildberries</b>
                    </p>
                  }
                />

                <Form
                  id="load-by-link"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await parseByUrl(link);
                  }}
                >
                  <div className=" w-full flex gap-4">
                    <Input
                      isRequired
                      label="Ссылка на товар"
                      validate={(value) => {
                        if (value === "") {
                          return "Заполните это поле";
                        }
                        if (value && !isURL(value)) {
                          return "Некорректная ссылка";
                        }
                        return null;
                      }}
                      value={link}
                      onPaste={(event: ClipboardEvent<HTMLInputElement>) => {
                        event.preventDefault();
                        setLink(
                          extractLink(event.clipboardData.getData("Text")),
                        );
                      }}
                      onValueChange={setLink}
                    />
                    {<MarketIcon className="my-auto" link={link} />}
                  </div>
                  {error != "" ? <p className="text-danger">{error}</p> : null}

                  <Button fullWidth isLoading={isLoading} type="submit">
                    Загрузить
                  </Button>
                </Form>
              </>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LoadByLinkModal;
