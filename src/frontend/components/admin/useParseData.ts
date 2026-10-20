import { useCallback, useEffect, useRef, useState } from "react";

import {
  getParseEvents,
  getParseServiceStatus,
  getParseShopsStatus,
  getParseStats,
} from "@/lib/client-requests/admin/parse";
import { getAvailableParser } from "@/lib/client-requests/parse";
import {
  ParseEvents,
  ParseOutcome,
  ParseServiceStatus,
  ParseShopsStatus,
  ParseStats,
  ServiceStatus,
} from "@/lib/models/parse";

const EVENTS_LIMIT = 50;

// В UTC, как считает статистику сервис парсинга
function getReportDates(days: number): [string, string] {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setUTCDate(dateFrom.getUTCDate() - (days - 1));
  return [
    dateFrom.toISOString().slice(0, 10),
    dateTo.toISOString().slice(0, 10),
  ];
}

// Ответы на устаревшие запросы (например, со старым фильтром) отбрасываются, ошибка запроса даёт null.
// load и apply должны быть стабильными, иначе меняется возвращаемая функция
function useLatestLoader<T>(
  load: () => Promise<T | null>,
  apply: (value: T | null) => void,
) {
  const lastRequest = useRef(0);
  return useCallback(async () => {
    const request = ++lastRequest.current;
    const value = await load().catch(() => null);
    if (request == lastRequest.current) {
      apply(value);
    }
  }, [load, apply]);
}

// undefined — данные ещё не загружались, null — запрос не удался.
// Отчёт и события грузятся только при isEnabled (после чтения сохранённых настроек),
// чтобы не запрашивать их дважды
export function useParseData({
  isEnabled,
  reportPeriod,
  refreshInterval,
  outcome,
  shop,
}: {
  isEnabled: boolean;
  reportPeriod: number;
  refreshInterval: number;
  outcome?: ParseOutcome;
  shop?: string;
}) {
  const [status, setStatus] = useState<ParseServiceStatus | null>();
  const [shopsStatus, setShopsStatus] = useState<ParseShopsStatus | null>();
  const [stats, setStats] = useState<ParseStats | null>();
  const [events, setEvents] = useState<ParseEvents | null>();
  // При смене фильтра прежние данные остаются под лоадером до прихода новых
  const [isStatsChanging, setIsStatsChanging] = useState(true);
  const [isEventsChanging, setIsEventsChanging] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date>();
  // Адреса магазинов по названию: /status отдаёт только названия, а иконка ищется по домену
  const [shopUrls, setShopUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getAvailableParser()
      .then((shops) => {
        if (Array.isArray(shops)) {
          setShopUrls(new Map(shops.map((shop) => [shop.name, shop.url])));
        }
      })
      .catch(() => {});
  }, []);

  const loadStatus = useLatestLoader(getParseServiceStatus, setStatus);
  const loadShops = useLatestLoader(getParseShopsStatus, setShopsStatus);

  const loadStatsData = useCallback(
    () => getParseStats(...getReportDates(reportPeriod)),
    [reportPeriod],
  );
  const applyStats = useCallback((newStats: ParseStats | null) => {
    setStats(newStats);
    setIsStatsChanging(false);
  }, []);
  const loadStats = useLatestLoader(loadStatsData, applyStats);

  const loadEventsData = useCallback(
    () => getParseEvents({ outcome, shop, limit: EVENTS_LIMIT }),
    [outcome, shop],
  );
  const applyEvents = useCallback((newEvents: ParseEvents | null) => {
    setEvents(newEvents);
    setIsEventsChanging(false);
  }, []);
  const loadEvents = useLatestLoader(loadEventsData, applyEvents);

  // Пока идёт обновление, новое не запускается: /status отвечает дольше короткого периода
  // автообновления, и иначе его ответы постоянно отбрасывались бы как устаревшие
  const isRefreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (isRefreshing.current) {
      return;
    }
    isRefreshing.current = true;
    setIsLoading(true);
    try {
      await Promise.all([loadStatus(), loadShops(), loadStats(), loadEvents()]);
      setUpdatedAt(new Date());
    } finally {
      setIsLoading(false);
      isRefreshing.current = false;
    }
  }, [loadStatus, loadShops, loadStats, loadEvents]);

  // Таймер обновления не перезапускается при смене фильтра и всегда вызывает актуальный refresh
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const timer = setInterval(
      () => refreshRef.current(),
      refreshInterval * 1000,
    );
    return () => clearInterval(timer);
  }, [refreshInterval]);

  useEffect(() => {
    loadStatus();
    loadShops();
  }, [loadStatus, loadShops]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    setIsStatsChanging(true);
    loadStats();
  }, [isEnabled, loadStats]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    setIsEventsChanging(true);
    loadEvents().then(() => setUpdatedAt(new Date()));
  }, [isEnabled, loadEvents]);

  const serviceStatus: ServiceStatus | undefined = !status
    ? undefined
    : status.status == "DOWN"
      ? "DOWN"
      : shopsStatus?.status == "DEGRADED"
        ? "DEGRADED"
        : "OK";

  return {
    status,
    serviceStatus,
    shopsStatus,
    stats,
    events,
    shopUrls,
    isLoading,
    isStatsChanging,
    isEventsChanging,
    updatedAt,
    refresh,
  };
}
