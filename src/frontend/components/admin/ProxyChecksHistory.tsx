"use client";
import { Modal } from "@heroui/react";
import { MouseEvent, useMemo, useState } from "react";

import { ParseProxy, ParseProxyHistoryCheck } from "@/lib/models/parse";

const HOUR_MS = 60 * 60 * 1000;
const HISTORY_HOURS = 72;
// Разрыв больше этого между соседними проверками считается пропуском:
// линия задержки через него не тянется
const GAP_MS = 15 * 60 * 1000;

const CHART_WIDTH = 800;
const CHART_HEIGHT = 220;
const CHART_LEFT = 44;
const CHART_TOP = 12;
const CHART_BOTTOM = 24;

const timeFormat = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const dayFormat = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
});

interface Point {
  time: number;
  ok: boolean;
  latency: number | null;
}

interface HourBucket {
  start: number;
  total: number;
  ok: number;
}

function toPoints(history: ParseProxyHistoryCheck[]): Point[] {
  return history.map((check) => ({
    time: new Date(check.checked_at).getTime(),
    ok: check.ok,
    latency: check.latency_ms,
  }));
}

// Часы выровнены по началу часа, последний — текущий, неполный
function toHourBuckets(points: Point[], now: number): HourBucket[] {
  const end = Math.ceil(now / HOUR_MS) * HOUR_MS;
  const start = end - HISTORY_HOURS * HOUR_MS;
  const buckets = Array.from({ length: HISTORY_HOURS }, (_, i) => ({
    start: start + i * HOUR_MS,
    total: 0,
    ok: 0,
  }));
  for (const point of points) {
    const index = Math.floor((point.time - start) / HOUR_MS);
    if (index >= 0 && index < HISTORY_HOURS) {
      buckets[index].total++;
      if (point.ok) {
        buckets[index].ok++;
      }
    }
  }
  return buckets;
}

function bucketColor(bucket: HourBucket): string {
  if (bucket.total === 0) {
    return "bg-default";
  }
  const share = bucket.ok / bucket.total;
  return share === 1 ? "bg-success" : share >= 0.8 ? "bg-warning" : "bg-danger";
}

function formatPercent(share: number): string {
  return `${(Math.floor(share * 1000) / 10).toLocaleString("ru")}%`;
}

function formatMinutes(ms: number): string {
  const minutes = Math.round(ms / 60000);
  return minutes < 60
    ? `${minutes} мин`
    : `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
}

function percentile(sorted: number[], p: number): number | null {
  return sorted.length
    ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
    : null;
}

// Простой длится от первой неудачной проверки до следующей успешной,
// а если прокси так и не ожил — до последней проверки
function longestOutage(points: Point[]): number {
  let longest = 0;
  let outageStart: number | null = null;
  for (const point of points) {
    if (!point.ok) {
      outageStart ??= point.time;
      longest = Math.max(longest, point.time - outageStart);
    } else if (outageStart !== null) {
      longest = Math.max(longest, point.time - outageStart);
      outageStart = null;
    }
  }
  return longest;
}

function getSummary(points: Point[]) {
  const latencies = points
    .filter((point) => point.ok && point.latency !== null)
    .map((point) => point.latency as number)
    .sort((a, b) => a - b);
  const okCount = points.filter((point) => point.ok).length;
  return {
    availability: points.length ? okCount / points.length : null,
    median: percentile(latencies, 0.5),
    p95: percentile(latencies, 0.95),
    outage: longestOutage(points),
  };
}

export const ProxyChecksStrip = ({
  proxy,
  onPress,
}: {
  proxy: ParseProxy;
  onPress: () => void;
}) => {
  const points = useMemo(
    () => toPoints(proxy.checks_history ?? []),
    [proxy.checks_history],
  );
  if (!points.length) {
    return <span className="text-muted">нет данных</span>;
  }
  const buckets = toHourBuckets(points, Date.now());
  const { availability } = getSummary(points);

  return (
    <button
      aria-label="История проверок прокси"
      className="flex cursor-pointer items-center gap-2 rounded-lg p-1 hover:bg-default"
      type="button"
      onClick={onPress}
    >
      <span className="flex h-5 gap-px">
        {buckets.map((bucket) => (
          <span
            key={bucket.start}
            className={`w-0.75 rounded-xs ${bucketColor(bucket)}`}
            title={`${timeFormat.format(bucket.start)}: ${bucket.ok} из ${bucket.total}`}
          />
        ))}
      </span>
      {availability !== null ? (
        <span className="text-sm whitespace-nowrap">
          {formatPercent(availability)}
        </span>
      ) : null}
    </button>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col rounded-xl bg-surface-secondary px-3 py-2">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-lg">{value}</span>
    </div>
  );
};

const LatencyChart = ({ points }: { points: Point[] }) => {
  const [hovered, setHovered] = useState<Point>();
  const now = Date.now();
  const from = now - HISTORY_HOURS * HOUR_MS;
  const maxLatency = Math.max(...points.map((point) => point.latency ?? 0));
  // Шкала до целых секунд, чтобы подписи были круглыми
  const yMax = Math.max(1000, Math.ceil(maxLatency / 1000) * 1000);
  const yStep = yMax > 5000 ? 2000 : 1000;
  const plotHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;

  const x = (time: number) =>
    CHART_LEFT + ((time - from) / (now - from)) * (CHART_WIDTH - CHART_LEFT);
  const y = (latency: number) => CHART_TOP + (1 - latency / yMax) * plotHeight;

  let path = "";
  // Подряд идущие неудачи сливаются в одну полосу до следующей проверки
  const failures: { start: number; end: number }[] = [];
  points.forEach((point, i) => {
    const previous = points[i - 1];
    const next = points[i + 1];
    if (point.ok && point.latency !== null) {
      const isContinued = previous?.ok && point.time - previous.time <= GAP_MS;
      path += `${isContinued ? "L" : "M"}${x(point.time).toFixed(1)} ${y(point.latency).toFixed(1)}`;
    } else if (!point.ok) {
      const end =
        next && next.time - point.time <= GAP_MS ? next.time : point.time;
      const last = failures[failures.length - 1];
      if (last && last.end === point.time) {
        last.end = end;
      } else {
        failures.push({ start: point.time, end });
      }
    }
  });

  const days: number[] = [];
  const firstDay = new Date(from);
  firstDay.setHours(24, 0, 0, 0);
  // Полночь у правого края не подписывается: подпись не влезет
  const lastDay = now - 4 * HOUR_MS;
  for (let day = firstDay.getTime(); day < lastDay; day += 24 * HOUR_MS) {
    days.push(day);
  }

  function hover(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const time =
      from +
      ((((event.clientX - rect.left) / rect.width) * CHART_WIDTH - CHART_LEFT) /
        (CHART_WIDTH - CHART_LEFT)) *
        (now - from);
    let nearest = points[0];
    for (const point of points) {
      if (Math.abs(point.time - time) < Math.abs(nearest.time - time)) {
        nearest = point;
      }
    }
    setHovered(nearest);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="h-5 text-sm text-muted">
        {hovered
          ? `${timeFormat.format(hovered.time)} · ${
              hovered.ok ? `${hovered.latency ?? "—"} мс` : "не работал"
            }`
          : "Задержка запроса через прокси"}
      </span>
      <svg
        className="h-auto w-full touch-none"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        onMouseLeave={() => setHovered(undefined)}
        onMouseMove={hover}
      >
        {Array.from({ length: yMax / yStep + 1 }, (_, i) => i * yStep).map(
          (latency) => (
            <g key={latency}>
              <line
                className="stroke-border"
                strokeWidth={1}
                x1={CHART_LEFT}
                x2={CHART_WIDTH}
                y1={y(latency)}
                y2={y(latency)}
              />
              <text
                className="fill-muted text-[11px]"
                textAnchor="end"
                x={CHART_LEFT - 6}
                y={y(latency) + 4}
              >
                {latency / 1000} с
              </text>
            </g>
          ),
        )}
        {days.map((day) => (
          <g key={day}>
            <line
              className="stroke-border"
              strokeDasharray="3 3"
              x1={x(day)}
              x2={x(day)}
              y1={CHART_TOP}
              y2={CHART_TOP + plotHeight}
            />
            <text
              className="fill-muted text-[11px]"
              x={x(day) + 4}
              y={CHART_HEIGHT - 6}
            >
              {dayFormat.format(day)}
            </text>
          </g>
        ))}
        {failures.map((failure) => (
          <rect
            key={failure.start}
            className="fill-danger/30"
            height={plotHeight}
            width={Math.max(1, x(failure.end) - x(failure.start))}
            x={x(failure.start)}
            y={CHART_TOP}
          />
        ))}
        <path
          className="stroke-accent"
          d={path}
          fill="none"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
        {hovered ? (
          <line
            className="stroke-foreground/40"
            x1={x(hovered.time)}
            x2={x(hovered.time)}
            y1={CHART_TOP}
            y2={CHART_TOP + plotHeight}
          />
        ) : null}
      </svg>
      <span className="text-xs text-muted">
        Красным отмечены неудачные проверки
      </span>
    </div>
  );
};

export const ProxyChecksModal = ({
  proxy,
  onClose,
}: {
  proxy?: ParseProxy;
  onClose: () => void;
}) => {
  const points = useMemo(
    () => toPoints(proxy?.checks_history ?? []),
    [proxy?.checks_history],
  );
  const summary = getSummary(points);

  return (
    <Modal.Backdrop
      isOpen={proxy !== undefined}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <Modal.Container placement="center" size="cover">
        <Modal.Dialog className="w-full max-w-240 px-2 md:px-4">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="break-all pr-8">
              Проверки {proxy?.url} за 3 дня
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4 p-1 pb-4">
            {points.length ? (
              <>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <SummaryCard
                    label="Доступность"
                    value={
                      summary.availability !== null
                        ? formatPercent(summary.availability)
                        : "—"
                    }
                  />
                  <SummaryCard
                    label="Медиана"
                    value={
                      summary.median !== null ? `${summary.median} мс` : "—"
                    }
                  />
                  <SummaryCard
                    label="p95"
                    value={summary.p95 !== null ? `${summary.p95} мс` : "—"}
                  />
                  <SummaryCard
                    label="Самый долгий простой"
                    value={summary.outage ? formatMinutes(summary.outage) : "—"}
                  />
                </div>
                <LatencyChart points={points} />
              </>
            ) : (
              <span className="text-muted">Проверок за 3 дня нет</span>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
