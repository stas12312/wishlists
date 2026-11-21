import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        "flex flex-col items-center justify-center text-center",
        compact
          ? "p-4 text-muted"
          : "min-h-48 rounded-3xl border border-dashed border-default px-4 py-8 sm:px-5 sm:py-14 md:py-20",
        className,
      )}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-4xl sm:mb-6 sm:size-24 sm:rounded-3xl sm:text-5xl"
        >
          {icon}
        </div>
      ) : null}
      {compact ? (
        <p>{title}</p>
      ) : (
        <h2 className="text-lg font-semibold sm:text-xl md:text-2xl">
          {title}
        </h2>
      )}
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted md:text-base">
          {description}
        </p>
      ) : null}
      {action ? (
        <div className="mt-5 w-full sm:mt-6 sm:w-auto">{action}</div>
      ) : null}
    </div>
  );
}
