"use client";
import {
  Alert,
  Button,
  Chip,
  FieldError,
  Form,
  InputGroup,
  Label,
  Modal,
  Skeleton,
  Spinner,
  TextField,
} from "@heroui/react";
import { ClipboardEvent, useEffect, useRef, useState } from "react";

import MarketIcon from "../marketIcon";

import {
  getAvailableParser,
  getParseStatus,
  parse,
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop variant="blur">
        <Modal.Container placement="center">
          <Modal.Dialog>
            <Modal.Header className="mx-auto">Автозаполнение</Modal.Header>
            <Modal.Body className="p-1">
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

                    <div className=" w-full  flex flex-col gap-2">
                      <TextField
                        fullWidth
                        isRequired
                        isDisabled={isLoading}
                        validate={(value) => {
                          if (value === "") {
                            return "Заполните это поле";
                          }
                          if (value && !isURL(value)) {
                            return "Некорректная ссылка";
                          }
                          return null;
                        }}
                        variant="secondary"
                      >
                        <Label>Ссылка на товар</Label>
                        <div className="flex gap-2">
                          <InputGroup className="w-full">
                            <InputGroup.Input
                              value={link}
                              onChange={(e) => {
                                setLink(e.target.value);
                              }}
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
                            />
                          </InputGroup>
                          <MarketIcon className="my-auto" link={link} />
                        </div>

                        <FieldError>{error}</FieldError>
                      </TextField>

                      <Button fullWidth isPending={isLoading} type="submit">
                        {({ isPending }) => (
                          <>
                            {isPending ? (
                              <Spinner color="current" size="sm" />
                            ) : null}
                            Загрузить
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <Alert color="danger" title={serviceError} />
                )}
              </>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
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
        <Skeleton className="w-32 rounded-full" />
        <Skeleton className="w-24 rounded-full" />
        <Skeleton className="w-36 rounded-full" />
      </>
    );
  }

  return shops.map((value) => {
    return (
      <Chip key={value.name} size="lg" title={value.name}>
        <MarketIcon height={22} link={value.url} />
        {value.name}
      </Chip>
    );
  });
};

export default LoadByLinkModal;
