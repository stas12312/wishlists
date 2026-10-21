"use client";
import {
  Button,
  Form,
  Input,
  Label,
  Table,
  TextField,
  toast,
} from "@heroui/react";
import { useState } from "react";
import {
  MdDeleteOutline,
  MdOutlinePlayArrow,
  MdOutlineSwapHoriz,
} from "react-icons/md";

import { ButtonWithLoader } from "../ButtonWithLoader";
import ConfirmationModal from "../ConfirmationModal";

import { EmptyState, formatDate, LoadingOverlay } from "./parseCommon";

import {
  activateParseProxy,
  addParseProxy,
  deleteParseProxy,
  rotateParseProxy,
} from "@/lib/client-requests/admin/parse";
import { ParseProxies, ParseProxy } from "@/lib/models/parse";

const STATS_COLUMNS: [keyof ParseProxy["stats"], string][] = [
  ["PARSED", "Успех"],
  ["PARSE_ERROR", "Ошибки"],
  ["ANTIBOT", "Антибот"],
];

const UNAVAILABLE = "Сервис парсинга недоступен";

export const ParseProxiesPanel = ({
  proxies,
  onCheck,
  onReload,
}: {
  // undefined — загрузка, null — сервис недоступен
  proxies: ParseProxies | null | undefined;
  onCheck: () => void;
  onReload: () => Promise<void>;
}) => {
  const [url, setUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [proxyToDelete, setProxyToDelete] = useState<ParseProxy>();

  async function perform(
    action: () => Promise<string | null>,
    successMessage: string,
  ) {
    setIsBusy(true);
    try {
      const error = await action().catch(() => UNAVAILABLE);
      if (error) {
        toast.danger(error);
      } else {
        toast(successMessage);
      }
      await onReload();
    } finally {
      setIsBusy(false);
    }
  }

  async function add() {
    setIsAdding(true);
    const error = await addParseProxy(url.trim()).catch(() => UNAVAILABLE);
    setIsAdding(false);
    if (error) {
      toast.danger(error);
      return;
    }
    setUrl("");
    toast("Прокси добавлен");
    await onReload();
  }

  const emptyText =
    proxies === undefined
      ? ""
      : proxies === null
        ? UNAVAILABLE
        : proxies.fallback
          ? `Пул пуст, используется прокси из настроек сервиса: ${proxies.fallback}`
          : "Пул пуст, парсинг идёт без прокси";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl">Прокси</h2>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" onPress={onCheck}>
            <MdOutlinePlayArrow />
            Проверить парсер
          </Button>
          <Button
            isDisabled={!proxies || proxies.items.length < 2 || isBusy}
            size="sm"
            variant="secondary"
            onPress={() =>
              perform(rotateParseProxy, "Переключено на следующий прокси")
            }
          >
            <MdOutlineSwapHoriz />
            Следующий
          </Button>
        </div>
      </div>

      <Form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <TextField
          isRequired
          className="min-w-72 flex-1"
          name="url"
          value={url}
          variant="secondary"
          onChange={setUrl}
        >
          <Label>Адрес прокси</Label>
          <Input placeholder="http://user:password@host:port" />
        </TextField>
        <ButtonWithLoader isLoading={isAdding} type="submit">
          Добавить
        </ButtonWithLoader>
      </Form>

      <LoadingOverlay isLoading={proxies === undefined || isBusy}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Пул прокси">
              <Table.Header>
                <Table.Column isRowHeader>Адрес</Table.Column>
                <Table.Column>Добавлен</Table.Column>
                {STATS_COLUMNS.map(([key, label]) => (
                  <Table.Column key={key}>{label}</Table.Column>
                ))}
                <Table.Column>Действия</Table.Column>
              </Table.Header>
              <Table.Body
                dependencies={[proxies, isBusy]}
                items={proxies?.items ?? []}
                renderEmptyState={() => <EmptyState text={emptyText} />}
              >
                {(item) => (
                  <Table.Row id={item.id}>
                    <Table.Cell className="min-w-64 break-all">
                      {item.url}
                      {item.active ? (
                        <span className="ml-2 text-sm text-success">
                          активный
                        </span>
                      ) : null}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {formatDate(item.added_at)}
                    </Table.Cell>
                    {STATS_COLUMNS.map(([key]) => (
                      <Table.Cell key={key}>{item.stats[key] ?? 0}</Table.Cell>
                    ))}
                    <Table.Cell>
                      <div className="flex gap-1">
                        <Button
                          isDisabled={item.active || isBusy}
                          size="sm"
                          variant="secondary"
                          onPress={() =>
                            perform(
                              () => activateParseProxy(item.id),
                              "Прокси выбран активным",
                            )
                          }
                        >
                          Сделать активным
                        </Button>
                        <Button
                          isIconOnly
                          aria-label="Удалить прокси"
                          isDisabled={isBusy}
                          size="sm"
                          variant="danger-soft"
                          onPress={() => setProxyToDelete(item)}
                        >
                          <MdDeleteOutline />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </LoadingOverlay>
      <span className="text-sm text-muted">
        Парсинг идёт через активный прокси; при блокировке антиботом сервис
        переключается на следующий по кругу, если не отключён
        PROXY_ROTATE_ON_ANTIBOT. Пароль после добавления не отображается.
      </span>

      <ConfirmationModal
        confirmName="Удалить"
        declineName="Отмена"
        isOpen={proxyToDelete !== undefined}
        message={
          <span className="break-all">
            Удалить прокси {proxyToDelete?.url} из пула?
          </span>
        }
        onConfirm={async () => {
          const proxy = proxyToDelete;
          setProxyToDelete(undefined);
          if (proxy) {
            await perform(() => deleteParseProxy(proxy.id), "Прокси удалён");
          }
        }}
        onDecline={() => setProxyToDelete(undefined)}
      />
    </div>
  );
};
