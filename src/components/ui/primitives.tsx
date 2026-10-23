import Link from "next/link";
import type { ReactNode } from "react";

import { cn, formatNumber, percent } from "@/lib/utils";

export const CHART_COLORS = [
  "#1c2740",
  "#3d557e",
  "#748cb4",
  "#c98a1c",
  "#e7bf5c",
  "#5f7f8c",
  "#a6b5d1",
  "#8c6b3f",
  "#526c99",
  "#dfa734",
  "#324467",
  "#9aa7bd",
];

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl leading-tight text-ink-950 sm:text-[2.6rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <article
      className={cn(
        "card card-pad relative break-inside-avoid overflow-hidden",
        accent && "border-gold-200 bg-gradient-to-br from-gold-50 via-white to-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="label">{label}</span>
        {icon ? (
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl bg-ink-50 text-ink-500",
              accent && "bg-gold-100 text-gold-700",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-4 font-display text-4xl leading-none text-ink-950">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-ink-500">{hint}</p>
    </article>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("card flex min-w-0 flex-col", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className={cn("flex-1 px-5 py-4 sm:px-6", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

const TONES = {
  neutral: "border-ink-200 bg-white text-ink-600",
  gold: "border-gold-200 bg-gold-50 text-gold-800",
  ink: "border-ink-200 bg-ink-50 text-ink-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
} as const;

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function BarList({
  items,
  total,
  unitLabel = "units",
}: {
  items: { label: string; value: number; href?: string; meta?: string }[];
  total: number;
  unitLabel?: string;
}) {
  return (
    <ul className="space-y-3.5">
      {items.map((item, index) => {
        const value = total ? Math.max(percent(item.value, total), 1.5) : 0;
        const content = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-ink-800">
                {item.label}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-ink-500">
                {formatNumber(item.value)} {unitLabel}
                <span className="ml-2 text-ink-300">
                  {percent(item.value, total)}%
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-50">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${value}%`,
                  backgroundColor:
                    index === 0 ? "#c98a1c" : CHART_COLORS[1 + (index % 8)],
                }}
              />
            </div>
            {item.meta ? (
              <p className="mt-1 text-[11px] text-ink-400">{item.meta}</p>
            ) : null}
          </>
        );

        return (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href} className="group block">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function DonutChart({
  data,
  centerLabel,
}: {
  data: { label: string; value: number }[];
  centerLabel: string;
}) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0) || 1;
  const radius = 54;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-[152px] w-[152px] shrink-0">
        <svg viewBox="0 0 152 152" className="h-full w-full -rotate-90">
          <circle
            cx="76"
            cy="76"
            r={radius}
            fill="none"
            stroke="#eef1f7"
            strokeWidth={stroke}
          />
          {data.map((entry, index) => {
            const length = (entry.value / total) * circumference;
            const circle = (
              <circle
                key={entry.label}
                cx="76"
                cy="76"
                r={radius}
                fill="none"
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={stroke}
                strokeDasharray={`${Math.max(length - 1.5, 0)} ${circumference}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-2xl leading-none text-ink-950">
              {formatNumber(total)}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
              {centerLabel}
            </p>
          </div>
        </div>
      </div>

      <ul className="w-full space-y-1.5">
        {data.map((entry, index) => (
          <li
            key={entry.label}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex min-w-0 items-center gap-2 text-ink-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
              <span className="truncate">{entry.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-ink-400">
              {percent(entry.value, total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-sm font-semibold text-ink-800">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-ink-500">
        {description}
      </p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
