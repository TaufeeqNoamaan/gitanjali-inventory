"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ChevronRightIcon, SearchIcon } from "@/components/icons";
import { EmptyState, Pill } from "@/components/ui/primitives";
import { FLOOR_ORDER } from "@/lib/normalize";
import type { ItemSummary } from "@/lib/types";
import { cn, formatNumber, pluralise, slugify } from "@/lib/utils";

type SortKey = "units" | "name" | "rooms";

export function ItemCatalog({ items }: { items: ItemSummary[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("units");
  const [floor, setFloor] = useState("");

  const floors = useMemo(
    () =>
      FLOOR_ORDER.filter((entry) =>
        items.some((item) => item.floors.includes(entry)),
      ),
    [items],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = items.filter((item) => {
      if (floor && !item.floors.includes(floor)) return false;
      if (!needle) return true;
      return item.name.toLowerCase().includes(needle);
    });

    return [...rows].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "rooms") return b.rooms - a.rooms || b.units - a.units;
      return b.units - a.units || a.name.localeCompare(b.name);
    });
  }, [items, query, sort, floor]);

  const totalUnits = filtered.reduce((sum, item) => sum + item.units, 0);

  return (
    <div className="space-y-4">
      <section className="card flex flex-col gap-3 p-4 no-print lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the item catalogue…"
            className="field pl-9"
            aria-label="Search items"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="nice-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1">
            <button
              type="button"
              onClick={() => setFloor("")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                floor === ""
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
              )}
            >
              All floors
            </button>
            {floors.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setFloor(entry)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  floor === entry
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
                )}
              >
                {entry}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="field h-9 w-auto shrink-0 text-xs"
            aria-label="Sort items"
          >
            <option value="units">Most units</option>
            <option value="rooms">Most rooms</option>
            <option value="name">A → Z</option>
          </select>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <p className="text-xs text-ink-500">
            <span className="font-semibold text-ink-900">
              {formatNumber(filtered.length)}
            </span>{" "}
            item types ·{" "}
            <span className="font-semibold text-ink-900">
              {formatNumber(totalUnits)}
            </span>{" "}
            units
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No items match"
            description="Try a different spelling or clear the floor filter."
          />
        ) : (
          <ul className="divide-y divide-ink-50">
            {filtered.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/items/${item.slug || slugify(item.name)}`}
                  className="group flex items-center gap-4 px-4 py-3 transition hover:bg-ink-50/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink-900 group-hover:text-ink-950">
                      {item.name}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      {item.floors.slice(0, 4).map((entry) => (
                        <span
                          key={entry}
                          className="rounded-md bg-ink-50 px-1.5 py-0.5 text-[10px] text-ink-500"
                        >
                          {entry}
                        </span>
                      ))}
                      {item.floors.length > 4 ? (
                        <span className="text-[10px] text-ink-400">
                          +{item.floors.length - 4} more
                        </span>
                      ) : null}
                    </span>
                  </span>

                  <span className="hidden w-24 text-right text-[11px] text-ink-400 sm:block">
                    {pluralise(item.rooms, "room")}
                  </span>

                  <span className="w-20 shrink-0 text-right">
                    <span className="block font-display text-lg leading-none text-ink-950">
                      {formatNumber(item.units)}
                    </span>
                    <span className="mt-0.5 block text-[9px] uppercase tracking-[0.12em] text-ink-400">
                      units
                    </span>
                  </span>

                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="flex items-center gap-2 text-[11px] text-ink-400 no-print">
        <Pill tone="ink">Tip</Pill>
        Select an item to see every room and floor it is spread across.
      </p>
    </div>
  );
}
