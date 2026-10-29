"use client";
import {
  Button,
  FieldError,
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
import { ProxyChecksModal, ProxyChecksStrip } from "./ProxyChecksHistory";

import {
  activateParseProxy,
  addParseProxy,
  checkParseProxy,
  deleteParseProxy,
  rotateParseProxy,
} from "@/lib/client-requests/admin/parse";
import { ParseProxies, ParseProxy, ParseProxyCheck } from "@/lib/models/parse";

const STATS_COLUMNS: [keyof ParseProxy["stats"], string][] = [
  ["PARSED", "Успех"],
  ["PARSE_ERROR", "Ошибки"],
  ["ANTIBOT", "Антибот"],
];

const UNAVAILABLE = "Сервис парсинга недоступен";

const ProxyCheckStatus = ({ check }: { check: ParseProxyCheck | null }) => {
  if (!check) {
    return <span className="text-muted">не проверялся</span>;
  }
  const details = [
    check.latency_ms !== null ? `${check.latency_ms} мс` : null,
    check.ip,
    formatDate(check.checked_at),
  ];
  return (
    <div className="flex flex-col">
      <span className={check.ok ? "text-success" : "text-danger"}>
        {check.ok ? "работает" : "не работает"}
      </span>
      <span className="text-xs whitespace-nowrap text-muted">
        {details.filter(Boolean).join(" · ")}
      </span>
      {check.error ? (
        // Текст ошибки curl длинный: в ячейке начало, целиком — в подсказке
        <span
          className="line-clamp-2 max-w-64 text-xs break-words text-muted"
          title={check.error}
        >
          {check.error}
        </span>
      ) : null}
    </div>
  );
};

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
  const [addError, setAddError] = useState<string>();
  // Какой из способов добавления выполняется: с проверкой прокси или без
  const [adding, setAdding] = useState<"checked" | "unchecked">();
  const [isBusy, setIsBusy] = useState(false);
  const [proxyToDelete, setProxyToDelete] = useState<ParseProxy>();
  const [proxyWithChecks, setProxyWithChecks] = useState<ParseProxy>();
  // Проверка идёт запросом через прокси и может занять время, поэтому таблица не блокируется
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());

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

  async function check(id: string) {
    setCheckingIds((ids) => new Set(ids).add(id));
    try {
      const error = await checkParseProxy(id).catch(() => UNAVAILABLE);
      if (error) {
        toast.danger(error);
      }
      await onReload();
    } finally {
      setCheckingIds((ids) => {
        const rest = new Set(ids);
        rest.delete(id);
        return rest;
      });
    }
  }

  async function add(check: boolean) {
    setAdding(check ? "checked" : "unchecked");
    setAddError(undefined);
    const error = await addParseProxy(url.trim(), check).catch(
      () => UNAVAILABLE,
    );
    setAdding(undefined);
    if (error) {
      setAddError(error);
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
          add(true);
        }}
      >
        <TextField
          isRequired
          className="min-w-72 flex-1"
          isInvalid={addError !== undefined}
          name="url"
          value={url}
          variant="secondary"
          onChange={(value) => {
            setUrl(value);
            setAddError(undefined);
          }}
        >
          <Label>Адрес прокси</Label>
          <Input placeholder="http://user:password@host:port" />
          <FieldError className="break-all">{addError}</FieldError>
        </TextField>
        <ButtonWithLoader
          isDisabled={adding !== undefined}
          isLoading={adding === "checked"}
          type="submit"
        >
          Добавить
        </ButtonWithLoader>
        <ButtonWithLoader
          isDisabled={!url.trim() || adding !== undefined}
          isLoading={adding === "unchecked"}
          variant="secondary"
          onPress={() => add(false)}
        >
          Без проверки
        </ButtonWithLoader>
      </Form>

      <LoadingOverlay isLoading={proxies === undefined || isBusy}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Пул прокси">
              <Table.Header>
                <Table.Column>ID</Table.Column>
                <Table.Column isRowHeader>Адрес</Table.Column>
                <Table.Column>Добавлен</Table.Column>
                <Table.Column>Проверка</Table.Column>
                <Table.Column>За 3 дня</Table.Column>
                {STATS_COLUMNS.map(([key, label]) => (
                  <Table.Column key={key}>{label}</Table.Column>
                ))}
                <Table.Column>Действия</Table.Column>
              </Table.Header>
              <Table.Body
                dependencies={[proxies, isBusy, checkingIds]}
                items={proxies?.items ?? []}
                renderEmptyState={() => <EmptyState text={emptyText} />}
              >
                {(item) => (
                  <Table.Row id={item.id}>
                    <Table.Cell className="whitespace-nowrap font-mono">
                      {item.id}
                    </Table.Cell>
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
                    <Table.Cell className="min-w-40">
                      <ProxyCheckStatus check={item.check} />
                    </Table.Cell>
                    <Table.Cell>
                      <ProxyChecksStrip
                        proxy={item}
                        onPress={() => setProxyWithChecks(item)}
                      />
                    </Table.Cell>
                    {STATS_COLUMNS.map(([key]) => (
                      <Table.Cell key={key}>{item.stats[key] ?? 0}</Table.Cell>
                    ))}
                    <Table.Cell>
                      <div className="flex gap-1">
                        <ButtonWithLoader
                          isDisabled={isBusy}
                          isLoading={checkingIds.has(item.id)}
                          size="sm"
                          variant="secondary"
                          onPress={() => check(item.id)}
                        >
                          Проверить
                        </ButtonWithLoader>
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
      <ProxyChecksModal
        proxy={proxyWithChecks}
        onClose={() => setProxyWithChecks(undefined)}
      />
    </div>
  );
};
