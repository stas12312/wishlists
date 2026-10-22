import { Chip, Spinner } from "@heroui/react";
import { ReactNode } from "react";

import MarketIcon from "../MarketIcon";

import { prepareDateString } from "@/lib/date";

export type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

// Неизвестные значения (сервис парсинга может добавить новые) показываются как есть
export const StatusChip = ({
  statuses,
  value,
  size,
}: {
  statuses: Record<string, [string, ChipColor]>;
  value: string;
  size?: "sm" | "md" | "lg";
}) => {
  const [label, color] = statuses[value] ?? [value, "default"];
  return (
    <Chip
      className="whitespace-nowrap"
      color={color}
      size={size}
      variant="soft"
    >
      {label}
    </Chip>
  );
};

export const EmptyState = ({ text }: { text: string }) => {
  return <div className="flex justify-center p-4 text-muted">{text}</div>;
};

export const LoadingOverlay = ({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: ReactNode;
}) => {
  return (
    <div aria-busy={isLoading} className="relative">
      {children}
      {isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-background/50">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
};

export const ShopName = ({ name, link }: { name: string; link?: string }) => {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <MarketIcon className="h-5 w-5 shrink-0" link={link} />
      {name}
    </span>
  );
};

export function formatDate(date: string | null): string {
  return date ? prepareDateString(date) : "—";
}

export function formatDuration(seconds: number | null | undefined): string {
  return seconds != null ? `${seconds.toFixed(1)} с` : "—";
}
