"use client";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { useRef, useState } from "react";

import MarketIcon from "../marketIcon";

import { parse, getParseStatus } from "@/lib/requests/parse";
import { ParseResult } from "@/lib/models/parse";

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
  const [status, setStatus] = useState("");

  async function parseByUrl(url: string) {
    setIsLoading(true);
    const data = await parse(url);
    setTaskId(data.task_id);
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
  }

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
              {status ? <p>{status}</p> : null}
              <Form
                id="load-by-link"
                onSubmit={async (event) => {
                  event.preventDefault();
                  await parseByUrl(link);
                }}
              >
                <div className=" w-full flex gap-4">
                  <Input
                    label="Ссылка на товар"
                    value={link}
                    onValueChange={setLink}
                  />
                  {<MarketIcon className="my-auto" link={link} />}
                </div>

                <Button fullWidth isLoading={isLoading} type="submit">
                  Загрузить
                </Button>
              </Form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LoadByLinkModal;
