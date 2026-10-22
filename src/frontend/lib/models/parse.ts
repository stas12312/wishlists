export interface ParseResult {
  title: string;
  cost: number;
  image: string;
  currency: string;
}

export interface ParseStatus {
  result: ParseResult;
  status: "FINISHED" | "FAILED" | "WAITING" | "RUNNING";
}

export interface ParseStartInfo {
  status: string;
  task_id: string;
}

export interface ParseError {
  detail: string;
}

export interface ShopParam {
  url: string;
  name: string;
}

export type ServiceStatus = "OK" | "DEGRADED" | "DOWN";

export type ShopParseStatus = "OK" | "BLOCKED" | "ERROR" | "UNKNOWN";

export type ParseOutcome =
  | "WAITING"
  | "RUNNING"
  | "PARSED"
  | "CACHED"
  | "PARSE_ERROR"
  | "ANTIBOT"
  | "OUT_OF_STOCK";

export type ParseOutcomeCounters = Record<ParseOutcome, number> & {
  requests: number;
};

export interface ShopParseState extends ParseOutcomeCounters {
  shop: string;
  status: ShopParseStatus;
  last_parsed_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
}

export interface ParseServiceStatus {
  status: "OK" | "DOWN";
  redis: boolean;
  workers: {
    online: number;
    names: string[];
    active_tasks: number;
  };
  queue: number | null;
}

export interface ParseShopsStatus {
  status: "OK" | "DEGRADED";
  shops: ShopParseState[];
}

export type ParseStatsCounters = ParseOutcomeCounters & {
  // Секунд
  avg_duration: number | null;
};

export interface ParseProxy {
  id: string;
  // Пароль сервис парсинга скрывает
  url: string;
  added_at: string;
  active: boolean;
  stats: Partial<Record<ParseOutcome, number>>;
  // null — прокси не проверялся
  working: boolean | null;
  check: ParseProxyCheck | null;
}

export interface ParseProxyCheck {
  ok: boolean;
  checked_at: string;
  latency_ms: number | null;
  // Внешний IP, который видит сервис проверки
  ip: string | null;
  error: string | null;
}

export interface ParseProxies {
  active: string | null;
  // PROXY_URL из настроек сервиса: используется, пока пул пуст
  fallback: string | null;
  items: ParseProxy[];
}

export interface ParseStats {
  date_from: string;
  date_to: string;
  total: ParseStatsCounters;
  shops: (ParseStatsCounters & { shop: string })[];
  days: (ParseStatsCounters & { date: string })[];
}

export interface ParseEvent {
  url: string;
  shop: string;
  outcome: ParseOutcome;
  created_at: string;
  task_id: string;
  duration: number | null;
  error: string | null;
  queued_at?: string | null;
  // Секунд от прихода ссылки до итога: ожидание в очереди и парсинг
  total_duration?: number | null;
  has_screenshot?: boolean;
}

export interface ParseEventsFilter {
  outcome?: ParseOutcome;
  shop?: string;
  limit?: number;
}

export interface ParseEvents {
  total: number;
  items: ParseEvent[];
}
