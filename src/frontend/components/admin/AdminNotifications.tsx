"use client";

import { Button, Input, ListBox, Select, Spinner, Table } from "@heroui/react";
import { useEffect, useState } from "react";
import { MdChevronRight, MdSearch } from "react-icons/md";

import { AdminNotificationModal } from "./AdminNotificationModal";
import {
  deliveryStatuses,
  notificationDate,
  notificationTime,
  NotificationStatus,
  siteStatuses,
} from "./notificationCommon";

import { EmptyState } from "@/components/EmptyState";
import { listAdminNotifications } from "@/lib/client-requests/admin/notification";
import {
  AdminNotification,
  AdminNotificationFilters,
} from "@/lib/models/admin-notification";
import { notificationTypes } from "@/lib/models/notification";

const channelOptions: [string, string][] = [
  ["", "Все каналы"],
  ["site", "На сайте"],
  ["email", "Email"],
  ["telegram", "Telegram"],
];
const periodOptions: [string, string][] = [
  ["", "За всё время"],
  ["1", "За 24 часа"],
  ["7", "За 7 дней"],
  ["30", "За 30 дней"],
];
const kindOptions: [string, string][] = [
  ["", "Все типы"],
  ...notificationTypes.map(({ kind, label }): [string, string] => [
    kind,
    label,
  ]),
];

export function AdminNotifications({ recipientId }: { recipientId?: number }) {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<AdminNotificationFilters>({
    search: "",
    kind: "",
    channel: "",
    status: "",
    period: "",
  });

  useEffect(() => {
    if (recipientId !== undefined) return;
    const timer = setTimeout(() => {
      const search = searchInput.trim();
      setFilters((current) =>
        current.search === search ? current : { ...current, search },
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [recipientId, searchInput]);

  const statusOptions: [string, string][] = [["", "Все статусы"]];
  if (filters.channel === "" || filters.channel === "site") {
    statusOptions.push(
      ...Object.entries(siteStatuses).map(
        ([key, [label]]): [string, string] => [key, label],
      ),
    );
  }
  if (filters.channel !== "site") {
    statusOptions.push(
      ...Object.entries(deliveryStatuses).map(
        ([key, [label]]): [string, string] => [key, label],
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        aria-label="Фильтры уведомлений"
        className="flex flex-wrap gap-2"
        role="group"
      >
        {recipientId === undefined && (
          <div className="relative w-full sm:max-w-[280px]">
            <MdSearch
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-xl text-muted"
            />
            <Input
              aria-label="Поиск по имени или логину"
              className="w-full pl-10"
              placeholder="Поиск по имени или @логину"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
        )}
        <NotificationFilter
          label="Тип уведомления"
          options={kindOptions}
          value={filters.kind}
          onChange={(kind) => setFilters((current) => ({ ...current, kind }))}
        />
        <NotificationFilter
          label="Канал"
          options={channelOptions}
          value={filters.channel}
          onChange={(channel) =>
            setFilters((current) => ({ ...current, channel, status: "" }))
          }
        />
        <NotificationFilter
          label="Статус"
          options={statusOptions}
          value={filters.status}
          onChange={(status) =>
            setFilters((current) => ({ ...current, status }))
          }
        />
        <NotificationFilter
          label="Период"
          options={periodOptions}
          value={filters.period}
          onChange={(period) =>
            setFilters((current) => ({ ...current, period }))
          }
        />
      </div>
      <NotificationResults
        key={JSON.stringify([recipientId, filters])}
        filters={filters}
        recipientId={recipientId}
      />
    </div>
  );
}

function NotificationFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      aria-label={label}
      className="w-[calc(50%-0.25rem)] min-w-0 sm:w-36"
      value={value || "all"}
      onChange={(key) =>
        onChange(key === "all" || key === null ? "" : String(key))
      }
    >
      <Select.Trigger>
        <Select.Value className="truncate" />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="min-w-max">
        <ListBox>
          {options.map(([id, text]) => (
            <ListBox.Item key={id || "all"} id={id || "all"} textValue={text}>
              {text}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function NotificationResults({
  filters,
  recipientId,
}: {
  filters: AdminNotificationFilters;
  recipientId?: number;
}) {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [next, setNext] = useState("");
  const [request, setRequest] = useState({ before: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [openedId, setOpenedId] = useState<number | null>(null);
  const [since] = useState(() =>
    filters.period
      ? new Date(Date.now() - Number(filters.period) * 86_400_000).toISOString()
      : undefined,
  );

  useEffect(() => {
    const controller = new AbortController();
    listAdminNotifications(
      { ...filters, recipientId },
      since,
      request.before,
      controller.signal,
    )
      .then(({ items: page, next }) => {
        if (controller.signal.aborted) return;
        setItems((current) => (request.before ? [...current, ...page] : page));
        setNext(next);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [filters, recipientId, request, since]);

  function load(before: string) {
    setHasError(false);
    setIsLoading(true);
    setRequest({ before });
  }

  return (
    <>
      {items.length > 0 && (
        <>
          <div className="hidden lg:block">
            <Table>
              <Table.ScrollContainer>
                <Table.Content
                  aria-label="Журнал уведомлений"
                  className={
                    recipientId === undefined
                      ? "min-w-[770px]"
                      : "min-w-[610px]"
                  }
                  onRowAction={(key) => setOpenedId(Number(key))}
                >
                  <Table.Header>
                    <Table.Column isRowHeader aria-sort="descending">
                      Создано ↓
                    </Table.Column>
                    {recipientId === undefined && (
                      <Table.Column>Получатель</Table.Column>
                    )}
                    <Table.Column>Уведомление</Table.Column>
                    <Table.Column>На сайте</Table.Column>
                    <Table.Column>Email</Table.Column>
                    <Table.Column>Telegram</Table.Column>
                    <Table.Column aria-label="Подробнее" />
                  </Table.Header>
                  <Table.Body items={items}>
                    {(item) => (
                      <Table.Row className="cursor-pointer" id={item.id}>
                        <Table.Cell className="whitespace-nowrap">
                          {notificationDate.format(new Date(item.created_at))}
                          <span className="block text-xs text-muted">
                            {notificationTime.format(new Date(item.created_at))}
                          </span>
                        </Table.Cell>
                        {recipientId === undefined && (
                          <Table.Cell>
                            {item.recipient_name || `@${item.username}`}
                            {item.recipient_name && (
                              <span className="block text-xs break-all text-muted">
                                @{item.username}
                              </span>
                            )}
                          </Table.Cell>
                        )}
                        <Table.Cell className="min-w-48">
                          {item.title || item.kind}
                          {item.entity_title && (
                            <span className="block max-w-md truncate text-xs text-muted">
                              {item.entity_title}
                            </span>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <NotificationStatus
                            site
                            status={item.read_at ? "read" : "unread"}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <NotificationStatus status={item.email_status} />
                        </Table.Cell>
                        <Table.Cell>
                          <NotificationStatus status={item.telegram_status} />
                        </Table.Cell>
                        <Table.Cell>
                          <MdChevronRight
                            aria-hidden="true"
                            className="text-lg text-muted"
                          />
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </div>
          <ul aria-label="Журнал уведомлений" className="space-y-2 lg:hidden">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className="w-full cursor-pointer space-y-2 rounded-2xl bg-surface p-3 text-left hover:bg-default-hover focus-visible:outline-2 focus-visible:outline-accent"
                  type="button"
                  onClick={() => setOpenedId(item.id)}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {item.title || item.kind}
                      </span>
                      {item.entity_title && (
                        <span className="block truncate text-xs text-muted">
                          {item.entity_title}
                        </span>
                      )}
                    </span>
                    <MdChevronRight
                      aria-hidden="true"
                      className="shrink-0 text-xl text-muted"
                    />
                  </span>
                  <span className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-xs text-muted">
                    {recipientId === undefined && (
                      <span>
                        {item.recipient_name
                          ? `${item.recipient_name} (@${item.username})`
                          : `@${item.username}`}
                      </span>
                    )}
                    <span>
                      {notificationDate.format(new Date(item.created_at))},{" "}
                      {notificationTime.format(new Date(item.created_at))}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-muted">На сайте</span>{" "}
                      <NotificationStatus
                        site
                        status={item.read_at ? "read" : "unread"}
                      />
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-muted">Email</span>{" "}
                      <NotificationStatus status={item.email_status} />
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-muted">Telegram</span>{" "}
                      <NotificationStatus status={item.telegram_status} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {isLoading && (
        <Spinner aria-label="Загрузка уведомлений" className="mx-auto my-3" />
      )}
      {hasError && (
        <div
          className="flex flex-wrap items-center justify-center gap-2"
          role="alert"
        >
          <span>Не удалось загрузить уведомления</span>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => load(request.before)}
          >
            Повторить
          </Button>
        </div>
      )}
      {!isLoading && !hasError && items.length === 0 && (
        <EmptyState compact title="Уведомлений не найдено" />
      )}
      {!isLoading && !hasError && next && (
        <Button
          className="mx-auto"
          variant="secondary"
          onPress={() => load(next)}
        >
          Показать ещё
        </Button>
      )}
      {openedId !== null && (
        <AdminNotificationModal
          id={openedId}
          onClose={() => setOpenedId(null)}
        />
      )}
    </>
  );
}
