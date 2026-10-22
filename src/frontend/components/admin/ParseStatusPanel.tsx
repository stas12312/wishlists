"use client";
import { Alert, Button, Chip, ListBox, Select, Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";
import { MdClose, MdRefresh } from "react-icons/md";

import { ButtonWithLoader } from "../ButtonWithLoader";

import { ParseCheckModal } from "./ParseCheckModal";
import { ParseEventsTable } from "./ParseEventsTable";
import { ParseProxiesPanel } from "./ParseProxiesPanel";
import { ParseShopsTable } from "./ParseShopsTable";
import { ChipColor, ShopName, StatusChip } from "./parseCommon";
import { useParseData } from "./useParseData";

import { ParseOutcome, ServiceStatus } from "@/lib/models/parse";

const REFRESH_INTERVALS: [number, string][] = [
  [1, "1 сек"],
  [5, "5 сек"],
  [10, "10 сек"],
  [15, "15 сек"],
  [30, "30 сек"],
  [60, "1 мин"],
];
const DEFAULT_REFRESH_INTERVAL = 30;
const REFRESH_INTERVAL_KEY = "admin.parse.refreshInterval";

const REPORT_PERIODS: [number, string][] = [
  [1, "1 день"],
  [3, "3 дня"],
  [7, "7 дней"],
  [14, "14 дней"],
  [30, "30 дней"],
  [60, "60 дней"],
  // Сервис парсинга хранит события 90 дней, больший период он не принимает
  [90, "90 дней"],
];
const DEFAULT_REPORT_PERIOD = 1;
const REPORT_PERIOD_KEY = "admin.parse.reportPeriod";

const SERVICE_STATUSES: Record<ServiceStatus, [string, ChipColor]> = {
  OK: ["Работает", "success"],
  DEGRADED: ["Есть проблемы", "warning"],
  DOWN: ["Не работает", "danger"],
};

const STATUS_SKELETON_WIDTHS = ["w-28", "w-28", "w-20", "w-30", "w-21"];

const StatusSkeleton = () => {
  return (
    <>
      {STATUS_SKELETON_WIDTHS.map((width, index) => (
        <Skeleton key={index} className={`h-7 rounded-full ${width}`} />
      ))}
    </>
  );
};

function readOption(
  key: string,
  options: [number, string][],
  defaultValue: number,
): number {
  try {
    const value = Number(localStorage.getItem(key));
    if (options.some(([option]) => option == value)) {
      return value;
    }
  } catch {}
  return defaultValue;
}

function saveOption(key: string, value: number) {
  try {
    localStorage.setItem(key, value.toString());
  } catch {}
}

const OptionSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [number, string][];
  value: number;
  onChange: (value: number) => void;
}) => {
  return (
    <Select
      aria-label={label}
      className="w-32"
      value={value.toString()}
      onChange={(key) => onChange(Number(key))}
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map(([option, optionLabel]) => (
            <ListBox.Item
              key={option}
              id={option.toString()}
              textValue={optionLabel}
            >
              {optionLabel}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};

export const ParseStatusPanel = () => {
  const [outcome, setOutcome] = useState<ParseOutcome>();
  const [shop, setShop] = useState<string>();
  const [refreshInterval, setRefreshInterval] = useState(
    DEFAULT_REFRESH_INTERVAL,
  );
  const [reportPeriod, setReportPeriod] = useState(DEFAULT_REPORT_PERIOD);
  const [isSettingsReady, setIsSettingsReady] = useState(false);
  const [isCheckOpen, setIsCheckOpen] = useState(false);

  useEffect(() => {
    setRefreshInterval(
      readOption(
        REFRESH_INTERVAL_KEY,
        REFRESH_INTERVALS,
        DEFAULT_REFRESH_INTERVAL,
      ),
    );
    setReportPeriod(
      readOption(REPORT_PERIOD_KEY, REPORT_PERIODS, DEFAULT_REPORT_PERIOD),
    );
    setIsSettingsReady(true);
  }, []);

  function changeRefreshInterval(seconds: number) {
    setRefreshInterval(seconds);
    saveOption(REFRESH_INTERVAL_KEY, seconds);
  }

  function changeReportPeriod(days: number) {
    setReportPeriod(days);
    saveOption(REPORT_PERIOD_KEY, days);
  }

  const {
    status,
    serviceStatus,
    shopsStatus,
    proxies,
    loadProxies,
    stats,
    events,
    shopUrls,
    isLoading,
    isStatsChanging,
    isEventsChanging,
    updatedAt,
    refresh,
  } = useParseData({
    isEnabled: isSettingsReady,
    reportPeriod,
    refreshInterval,
    outcome,
    shop,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {status && serviceStatus ? (
          <>
            <StatusChip
              size="lg"
              statuses={SERVICE_STATUSES}
              value={serviceStatus}
            />
            <Chip color={status.redis ? "default" : "danger"} size="lg">
              Redis: {status.redis ? "доступен" : "недоступен"}
            </Chip>
            <Chip
              color={status.workers.online ? "default" : "danger"}
              size="lg"
            >
              Воркеры: {status.workers.online}
            </Chip>
            <Chip size="lg">Задач в работе: {status.workers.active_tasks}</Chip>
            <Chip size="lg">Очередь: {status.queue ?? "—"}</Chip>
          </>
        ) : status === undefined ? (
          <StatusSkeleton />
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          {updatedAt ? (
            <span className="text-sm text-muted">
              Обновлено в {updatedAt.toLocaleTimeString()}
            </span>
          ) : null}
          <OptionSelect
            label="Период автообновления"
            options={REFRESH_INTERVALS}
            value={refreshInterval}
            onChange={changeRefreshInterval}
          />
          <ButtonWithLoader
            isLoading={isLoading}
            size="sm"
            variant="secondary"
            onPress={refresh}
          >
            <MdRefresh />
            Обновить
          </ButtonWithLoader>
        </div>
      </div>

      {status === null || shopsStatus === null ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Сервис парсинга недоступен</Alert.Title>
          </Alert.Content>
        </Alert>
      ) : stats === null ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Не удалось загрузить отчёт за период</Alert.Title>
          </Alert.Content>
        </Alert>
      ) : null}

      <ParseCheckModal
        isOpen={isCheckOpen}
        onClose={() => setIsCheckOpen(false)}
        onFinish={refresh}
      />

      <ParseProxiesPanel
        proxies={proxies}
        onCheck={() => setIsCheckOpen(true)}
        onReload={loadProxies}
      />

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl">Магазины</h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted">Отчёт за</span>
          <OptionSelect
            label="Период отчёта"
            options={REPORT_PERIODS}
            value={reportPeriod}
            onChange={changeReportPeriod}
          />
        </div>
      </div>
      <ParseShopsTable
        isLoading={isStatsChanging}
        selectedShop={shop}
        shopUrls={shopUrls}
        shopsStatus={shopsStatus}
        stats={stats}
        onSelectShop={setShop}
      />
      <span className="text-sm text-muted">
        Статус, последний парсинг и ошибка — за последние 24 часа; счётчики и
        среднее время успешного парсинга — за выбранный период. Нажмите на
        магазин, чтобы отфильтровать события.
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl">Последние события</h2>
        {shop ? (
          <Button
            size="sm"
            variant="tertiary"
            onPress={() => setShop(undefined)}
          >
            <ShopName link={shopUrls.get(shop)} name={shop} />
            <MdClose />
          </Button>
        ) : null}
      </div>
      <ParseEventsTable
        events={events}
        isLoading={isEventsChanging}
        outcome={outcome}
        onChangeOutcome={setOutcome}
      />
    </div>
  );
};
