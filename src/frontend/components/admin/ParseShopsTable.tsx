"use client";
import { Button, Table } from "@heroui/react";
import { useMemo } from "react";

import {
  ChipColor,
  EmptyState,
  formatDate,
  formatDuration,
  LoadingOverlay,
  ShopName,
  StatusChip,
} from "./parseCommon";

import {
  ParseOutcome,
  ParseShopsStatus,
  ParseStats,
  ShopParseStatus,
} from "@/lib/models/parse";

const SHOP_STATUSES: Record<ShopParseStatus, [string, ChipColor]> = {
  OK: ["Работает", "success"],
  BLOCKED: ["Антибот", "warning"],
  ERROR: ["Ошибка", "danger"],
  UNKNOWN: ["Не парсился сутки", "default"],
};

export const ParseShopsTable = ({
  shopsStatus,
  stats,
  shopUrls,
  selectedShop,
  isLoading,
  onSelectShop,
}: {
  shopsStatus: ParseShopsStatus | null | undefined;
  stats: ParseStats | null | undefined;
  shopUrls: Map<string, string>;
  selectedShop?: string;
  isLoading: boolean;
  onSelectShop: (shop: string) => void;
}) => {
  // В ответе только магазины, по которым были события за период
  const shopStats = useMemo(
    () => new Map(stats?.shops.map((item) => [item.shop, item])),
    [stats],
  );
  const periodCount = (shopName: string, key: ParseOutcome) =>
    stats === undefined
      ? "…"
      : stats === null
        ? "—"
        : (shopStats.get(shopName)?.[key] ?? 0);
  const processingCount = (shopName: string) =>
    stats
      ? (shopStats.get(shopName)?.WAITING ?? 0) +
        (shopStats.get(shopName)?.RUNNING ?? 0)
      : periodCount(shopName, "WAITING");

  return (
    <LoadingOverlay isLoading={isLoading || shopsStatus === undefined}>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Состояние парсеров магазинов">
            <Table.Header>
              <Table.Column isRowHeader>Магазин</Table.Column>
              <Table.Column>Статус</Table.Column>
              <Table.Column>Последний парсинг</Table.Column>
              <Table.Column>Последний успех</Table.Column>
              <Table.Column>Последняя ошибка</Table.Column>
              <Table.Column>Успех</Table.Column>
              <Table.Column>Кэш</Table.Column>
              <Table.Column>Ошибки</Table.Column>
              <Table.Column>Антибот</Table.Column>
              <Table.Column>Нет в наличии</Table.Column>
              <Table.Column>В обработке</Table.Column>
              <Table.Column>Среднее время</Table.Column>
            </Table.Header>
            <Table.Body
              dependencies={[selectedShop, stats, shopUrls]}
              items={shopsStatus?.shops ?? []}
              renderEmptyState={() => (
                <EmptyState
                  text={shopsStatus === undefined ? "" : "Нет данных"}
                />
              )}
            >
              {(item) => (
                <Table.Row id={item.shop}>
                  <Table.Cell>
                    <Button
                      size="sm"
                      variant={
                        selectedShop == item.shop ? "secondary" : "ghost"
                      }
                      onPress={() => onSelectShop(item.shop)}
                    >
                      <ShopName
                        link={shopUrls.get(item.shop)}
                        name={item.shop}
                      />
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusChip statuses={SHOP_STATUSES} value={item.status} />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(item.last_parsed_at)}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(item.last_success_at)}
                  </Table.Cell>
                  <Table.Cell className="max-w-80 break-words">
                    {item.last_error ?? "—"}
                  </Table.Cell>
                  <Table.Cell>{periodCount(item.shop, "PARSED")}</Table.Cell>
                  <Table.Cell>{periodCount(item.shop, "CACHED")}</Table.Cell>
                  <Table.Cell>
                    {periodCount(item.shop, "PARSE_ERROR")}
                  </Table.Cell>
                  <Table.Cell>{periodCount(item.shop, "ANTIBOT")}</Table.Cell>
                  <Table.Cell>
                    {periodCount(item.shop, "OUT_OF_STOCK")}
                  </Table.Cell>
                  <Table.Cell>{processingCount(item.shop)}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDuration(shopStats.get(item.shop)?.avg_duration)}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </LoadingOverlay>
  );
};
