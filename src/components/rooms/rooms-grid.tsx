"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ChevronRightIcon, DoorIcon, SearchIcon } from "@/components/icons";
import { EmptyState, Pill } from "@/components/ui/primitives";
import { FLOOR_ORDER } from "@/lib/normalize";
import type { RoomSummary } from "@/lib/types";
import { cn, formatNumber, pluralise } from "@/lib/utils";

export function RoomsGrid({ rooms }: { rooms: RoomSummary[] }) {
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState("");

  const floors = useMemo(
    () =>
      FLOOR_ORDER.filter((entry) => rooms.some((room) => room.floor === entry)),
    [rooms],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rooms.filter((room) => {
      if (floor && room.floor !== floor) return false;
      if (!needle) return true;
      return (
        room.room.toLowerCase().includes(needle) ||
        room.roomType.toLowerCase().includes(needle) ||
        room.floor.toLowerCase().includes(needle)
      );
    });
  }, [rooms, query, floor]);

  const grouped = useMemo(() => {
    return floors
      .map((entry) => ({
        floor: entry,
        rooms: filtered.filter((room) => room.floor === entry),
      }))
      .filter((group) => group.rooms.length > 0);
  }, [filtered, floors]);

  return (
    <div className="space-y-5">
      <section className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search room, floor or room type…"
            className="field pl-9"
            aria-label="Search rooms"
          />
        </div>

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
      </section>

      {grouped.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No rooms found"
            description="No room on campus matches that search."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFloor("");
                }}
                className="btn-ghost text-xs"
              >
                Reset
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => {
            const units = group.rooms.reduce((sum, room) => sum + room.units, 0);
            return (
              <section key={group.floor}>
                <div className="mb-3 flex items-end justify-between gap-3 border-b border-ink-100 pb-2">
                  <h2 className="font-display text-xl text-ink-950">
                    {group.floor}
                  </h2>
                  <p className="text-[11px] font-medium text-ink-400">
                    {pluralise(group.rooms.length, "room")} ·{" "}
                    {formatNumber(units)} units
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {group.rooms.map((room) => (
                    <Link
                      key={room.slug}
                      href={`/rooms/${room.slug}`}
                      className="card group flex min-w-0 flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-lift"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-ink-900 group-hover:text-ink-950">
                            {room.room}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-400">
                            <DoorIcon className="h-3 w-3" />
                            {pluralise(room.itemTypes, "item type")}
                          </p>
                        </div>
                        <Pill>{room.roomType}</Pill>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="font-display text-2xl leading-none text-ink-950">
                            {formatNumber(room.units)}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-400">
                            units
                          </p>
                        </div>
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-50 text-ink-400 transition group-hover:bg-ink-900 group-hover:text-white">
                          <ChevronRightIcon className="h-3.5 w-3.5" />
                        </span>
                      </div>

                      {room.topItems.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1 border-t border-ink-50 pt-3">
                          {room.topItems.map((item) => (
                            <span
                              key={item.name}
                              className="max-w-full truncate rounded-md bg-ink-50 px-1.5 py-0.5 text-[10px] text-ink-500"
                            >
                              {item.name} · {item.units}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
