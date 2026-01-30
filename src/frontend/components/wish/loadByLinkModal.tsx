"use client";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { useEffect, useRef, useState, ClipboardEvent } from "react";
import { Alert } from "@heroui/alert";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

import MarketIcon from "../marketIcon";

import {
  parse,
  getParseStatus,
  getAvailableParser,
} from "@/lib/client-requests/parse";
import { ParseResult, ShopParam } from "@/lib/models/parse";
import { extractLink, isURL } from "@/lib/url";

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

  const [error, setError] = useState("");

  const [serviceError, setServiceError] = useState("");

  async function parseByUrl(url: string) {
    setError("");
    setIsLoading(true);
    const data = await parse(url);
    if ("detail" in data) {
      setError(data.detail);
      setIsLoading(false);
      return;
    }

    await updateStatus(data.task_id, url);
    timer.current = setInterval(() => {
      updateStatus(data.task_id, url);
    }, 500);
  }

  async function updateStatus(taskId: string, url: string) {
    const status = await getParseStatus(taskId);

    if (status.status == "FINISHED") {
      onLinkLoad(status.result, url);
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
      placement="center"
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="mx-auto">Автозаполнение</ModalHeader>
            <ModalBody>
              <>
                {!serviceError ? (
                  <Form
                    id="load-by-link"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      await parseByUrl(link);
                    }}
                  >
                    <ShopsBlock onError={setServiceError} />

                    <div className=" w-full flex gap-4">
                      <Input
                        isRequired
                        isDisabled={isLoading}
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
                        onPaste={async (
                          event: ClipboardEvent<HTMLInputElement>,
                        ) => {
                          event.preventDefault();
                          const link = extractLink(
                            event.clipboardData.getData("Text"),
                          );
                          setLink(link);

                          await parseByUrl(link);
                        }}
                        onValueChange={setLink}
                      />
                      {<MarketIcon className="my-auto" link={link} />}
                    </div>
                    {error != "" ? (
                      <p className="text-danger">{error}</p>
                    ) : null}

                    <Button fullWidth isLoading={isLoading} type="submit">
                      Загрузить
                    </Button>
                  </Form>
                ) : (
                  <Alert color="danger" title={serviceError} />
                )}
              </>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const ShopsBlock = ({ onError }: { onError: { (error: string): void } }) => {
  const [availableParser, setAvailableParser] = useState<ShopParam[]>([]);
  const [listIsLoading, setListIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const parsers = await getAvailableParser();
      if ("message" in parsers) {
        onError(parsers.message);
      } else {
        setAvailableParser(parsers);
      }

      setListIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Alert
      color="primary"
      title="На данный момент поддерживается заполнение из"
    >
      <div title="На данный момент поддерживается заполнение из">
        <div className="flex gap-1 mt-2 flex-wrap">
          <AvailableShops isLoading={listIsLoading} shops={availableParser} />
        </div>
      </div>
    </Alert>
  );
};
const AvailableShops = ({
  isLoading,
  shops,
}: {
  isLoading: boolean;
  shops: ShopParam[];
}) => {
  if (isLoading) {
    return (
      <>
        <Skeleton className="w-32 rounded-full">
          <div className="h-7 w-1/5 rounded-full bg-default-300" />
        </Skeleton>
        <Skeleton className="w-24 rounded-full">
          <div className="h-7 w-1/5 rounded-full bg-default-300" />
        </Skeleton>
        <Skeleton className="w-36 rounded-full">
          <div className="h-7 w-1/5 rounded-full bg-default-300" />
        </Skeleton>
      </>
    );
  }

  return shops.map((value) => {
    return (
      <Chip
        key={value.name}
        startContent={<MarketIcon height={22} link={value.url} />}
        title={value.name}
        variant="flat"
      >
        {value.name}
      </Chip>
    );
  });
};

export default LoadByLinkModal;
