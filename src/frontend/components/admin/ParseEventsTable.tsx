"use client";
import { Link, Popover, Table, Tabs } from "@heroui/react";
import { useState } from "react";
import {
  MdOutlineBugReport,
  MdOutlineDataObject,
  MdOutlineScreenshotMonitor,
} from "react-icons/md";

import { ParseErrorModal } from "./ParseErrorModal";
import {
  ChipColor,
  EmptyState,
  formatDate,
  formatDuration,
  LoadingOverlay,
  ShopName,
  StatusChip,
} from "./parseCommon";

import { ParseEvent, ParseEvents, ParseOutcome } from "@/lib/models/parse";

const OUTCOMES: Record<ParseOutcome, [string, ChipColor]> = {
  WAITING: ["В очереди", "default"],
  RUNNING: ["В работе", "accent"],
  PARSED: ["Успех", "success"],
  CACHED: ["Кэш", "accent"],
  PARSE_ERROR: ["Ошибка", "danger"],
  ANTIBOT: ["Антибот", "warning"],
  OUT_OF_STOCK: ["Нет в наличии", "default"],
};

const ALL_OUTCOMES = "ALL";

// Полный адрес с логином показывается в подсказке, чтобы не расширять таблицу
const proxyLabel = (event: ParseEvent) => {
  if (event.proxy_id) {
    return event.proxy_id;
  }
  return event.proxy ? "PROXY_URL" : "—";
};

export const ParseEventsTable = ({
  events,
  outcome,
  isLoading,
  onChangeOutcome,
}: {
  events: ParseEvents | null | undefined;
  outcome?: ParseOutcome;
  isLoading: boolean;
  onChangeOutcome: (outcome?: ParseOutcome) => void;
}) => {
  // Событие остаётся после закрытия, чтобы окно не пустело на время анимации
  const [errorEvent, setErrorEvent] = useState<ParseEvent>();
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  return (
    <>
      <Tabs
        selectedKey={outcome ?? ALL_OUTCOMES}
        onSelectionChange={(key) =>
          onChangeOutcome(
            key == ALL_OUTCOMES ? undefined : (key.toString() as ParseOutcome),
          )
        }
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Итог обработки">
            <Tabs.Tab id={ALL_OUTCOMES}>
              Все
              <Tabs.Indicator />
            </Tabs.Tab>
            {Object.entries(OUTCOMES).map(([key, [label]]) => (
              <Tabs.Tab key={key} id={key}>
                {label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
      <LoadingOverlay isLoading={isLoading || events === undefined}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Последние обработанные ссылки">
              <Table.Header>
                <Table.Column isRowHeader>Время</Table.Column>
                <Table.Column>Магазин</Table.Column>
                <Table.Column>Итог</Table.Column>
                <Table.Column>Парсинг</Table.Column>
                <Table.Column>Всего</Table.Column>
                <Table.Column>Ссылка</Table.Column>
                <Table.Column>Прокси</Table.Column>
                <Table.Column>Ошибка</Table.Column>
              </Table.Header>
              <Table.Body
                items={events?.items ?? []}
                renderEmptyState={() => (
                  <EmptyState
                    text={events === undefined ? "" : "Нет событий"}
                  />
                )}
              >
                {(item) => (
                  <Table.Row id={`${item.task_id}-${item.created_at}`}>
                    <Table.Cell className="whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </Table.Cell>
                    <Table.Cell>
                      <ShopName link={item.url} name={item.shop} />
                    </Table.Cell>
                    <Table.Cell>
                      <StatusChip statuses={OUTCOMES} value={item.outcome} />
                    </Table.Cell>
                    <Table.Cell>{formatDuration(item.duration)}</Table.Cell>
                    <Table.Cell>
                      {formatDuration(item.total_duration)}
                    </Table.Cell>
                    <Table.Cell className="max-w-80 truncate">
                      <Link href={item.url} target="_blank">
                        {item.url}
                      </Link>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {item.proxy ? (
                        <Popover>
                          <Popover.Trigger
                            aria-label="Адрес прокси"
                            className="cursor-pointer underline decoration-dotted underline-offset-4"
                          >
                            <span
                              className={
                                item.proxy_id ? "font-mono" : undefined
                              }
                            >
                              {proxyLabel(item)}
                            </span>
                          </Popover.Trigger>
                          <Popover.Content className="max-w-md">
                            <Popover.Dialog>
                              <Popover.Arrow />
                              <p className="break-all font-mono text-sm select-all">
                                {item.proxy}
                              </p>
                            </Popover.Dialog>
                          </Popover.Content>
                        </Popover>
                      ) : (
                        proxyLabel(item)
                      )}
                    </Table.Cell>
                    <Table.Cell className="max-w-80 break-words">
                      {item.has_screenshot ||
                      item.has_response ||
                      item.has_traceback ? (
                        <Link
                          className="inline cursor-pointer text-left"
                          onPress={() => {
                            setErrorEvent(item);
                            setIsErrorOpen(true);
                          }}
                        >
                          {item.has_screenshot ? (
                            <MdOutlineScreenshotMonitor className="mr-1 inline-block h-[1.1em] w-[1.1em] align-[-0.2em]" />
                          ) : item.has_response ? (
                            <MdOutlineDataObject className="mr-1 inline-block h-[1.1em] w-[1.1em] align-[-0.2em]" />
                          ) : (
                            <MdOutlineBugReport className="mr-1 inline-block h-[1.1em] w-[1.1em] align-[-0.2em]" />
                          )}
                          {item.error ?? "Подробности ошибки"}
                        </Link>
                      ) : (
                        (item.error ?? "—")
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </LoadingOverlay>
      <ParseErrorModal
        event={errorEvent}
        isOpen={isErrorOpen}
        onClose={() => setIsErrorOpen(false)}
      />
    </>
  );
};
