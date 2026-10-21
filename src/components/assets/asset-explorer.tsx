"use client";

import { useEffect, useMemo, useState } from "react";

import { AssetDrawer } from "@/components/assets/asset-drawer";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  SearchIcon,
} from "@/components/icons";
import { EmptyState, PageHeader, Pill } from "@/components/ui/primitives";
import { FLOOR_ORDER } from "@/lib/normalize";
import type { Asset } from "@/lib/types";
import { cn, downloadFile, formatNumber, toCsv } from "@/lib/utils";

type SortKey = "default" | "item" | "qty" | "room" | "floor";
type FlagKey = "" | "missing-serial" | "qr-pending" | "flagged";

export type InitialFilters = {
  query?: string;
  floor?: string;
  room?: string;
  item?: string;
  roomType?: string;
  flag?: string;
};

const PAGE_SIZES = [25, 50, 100];
const QR_PATTERN = /TO PUT QR|QR TAIR/i;
const FLAG_PATTERN = /NOT WORKING|SPAIR|OLD IN USE/i;

const FLAG_LABELS: Record<Exclude<FlagKey, "">, string> = {
  "missing-serial": "Missing serial number",
  "qr-pending": "QR sticker pending",
  flagged: "Spare / inactive",
};

function SortButton({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        "group inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition",
        active ? "text-ink-900" : "text-ink-400 hover:text-ink-700",
        align === "right" && "justify-end",
      )}
    >
      {label}
      <ChevronDownIcon
        className={cn(
          "h-3 w-3 transition",
          active && sort.dir === "asc" && "rotate-180",
          !active && "opacity-0 group-hover:opacity-50",
        )}
      />
    </button>
  );
}

export function AssetExplorer({
  assets,
  roomSlugs,
  initial,
}: {
  assets: Asset[];
  roomSlugs: Record<string, string>;
  initial: InitialFilters;
}) {
  const [query, setQuery] = useState(initial.query ?? "");
  const [floor, setFloor] = useState(initial.floor ?? "");
  const [room, setRoom] = useState(initial.room ?? "");
  const [item, setItem] = useState(initial.item ?? "");
  const [roomType, setRoomType] = useState(initial.roomType ?? "");
  const [flag, setFlag] = useState<FlagKey>((initial.flag as FlagKey) ?? "");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "default",
    dir: "asc",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Asset | null>(null);

  const floors = useMemo(
    () => FLOOR_ORDER.filter((entry) => assets.some((row) => row.floor === entry)),
    [assets],
  );

  const rooms = useMemo(() => {
    const unique = new Set(
      assets
        .filter((row) => !floor || row.floor === floor)
        .map((row) => row.room),
    );
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [assets, floor]);

  const items = useMemo(
    () => [...new Set(assets.map((row) => row.itemName))].sort((a, b) => a.localeCompare(b)),
    [assets],
  );

  const roomTypes = useMemo(
    () => [...new Set(assets.map((row) => row.roomType))].sort((a, b) => a.localeCompare(b)),
    [assets],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return assets.filter((row) => {
      if (floor && row.floor !== floor) return false;
      if (room && row.room !== room) return false;
      if (item && row.itemName !== item) return false;
      if (roomType && row.roomType !== roomType) return false;

      if (flag) {
        const notes = `${row.serialNo ?? ""} ${row.modelNo ?? ""}`;
        if (flag === "missing-serial" && row.serialNo) return false;
        if (flag === "qr-pending" && !QR_PATTERN.test(notes)) return false;
        if (flag === "flagged" && !FLAG_PATTERN.test(notes)) return false;
      }

      if (!needle) return true;

      return [
        row.itemName,
        row.room,
        row.floor,
        row.subLocation,
        row.roomType,
        row.serialNo ?? "",
        row.modelNo ?? "",
        row.id,
      ].some((value) => value.toLowerCase().includes(needle));
    });
  }, [assets, query, floor, room, item, roomType, flag]);

  const sorted = useMemo(() => {
    if (sort.key === "default") return filtered;
    const direction = sort.dir === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "item":
          return a.itemName.localeCompare(b.itemName) * direction;
        case "qty":
          return (a.quantity - b.quantity) * direction;
        case "room":
          return a.room.localeCompare(b.room) * direction;
        case "floor":
          return (
            (FLOOR_ORDER.indexOf(a.floor) - FLOOR_ORDER.indexOf(b.floor)) *
            direction
          );
        default:
          return 0;
      }
    });
  }, [filtered, sort]);

  const totalUnits = useMemo(
    () => filtered.reduce((sum, row) => sum + row.quantity, 0),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, floor, room, item, roomType, flag, pageSize]);

  const activeFilters = [
    floor && { key: "floor", label: floor, clear: () => setFloor("") },
    room && { key: "room", label: room, clear: () => setRoom("") },
    item && { key: "item", label: item, clear: () => setItem("") },
    roomType && {
      key: "roomType",
      label: roomType,
      clear: () => setRoomType(""),
    },
    flag && {
      key: "flag",
      label: FLAG_LABELS[flag as Exclude<FlagKey, "">],
      clear: () => setFlag(""),
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => {
    setQuery("");
    setFloor("");
    setRoom("");
    setItem("");
    setRoomType("");
    setFlag("");
  };

  const handleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "qty" ? "desc" : "asc" },
    );
  };

  const exportCsv = () => {
    const headers = [
      "Record ID",
      "Item name",
      "Quantity",
      "Serial no",
      "Model no",
      "Location",
      "Sub location",
      "Room",
      "Floor",
      "Room type",
    ];
    const rows = sorted.map((row) => [
      row.id,
      row.itemName,
      row.quantity,
      row.serialNo,
      row.modelNo,
      row.location,
      row.subLocation,
      row.room,
      row.floor,
      row.roomType,
    ]);

    downloadFile(
      `gitanjali-assets-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(headers, rows),
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Register"
        title="Asset register"
        description="Search and filter every recorded asset down to a single serial number."
        actions={
          <button type="button" onClick={exportCsv} className="btn-ghost">
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      <section className="card p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item, room, serial number or record ID…"
              className="field h-11 pl-9 pr-9"
              aria-label="Search assets"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                aria-label="Clear search"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <select
              value={floor}
              onChange={(event) => {
                setFloor(event.target.value);
                setRoom("");
              }}
              className="field"
              aria-label="Filter by floor"
            >
              <option value="">All floors</option>
              {floors.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>

            <select
              value={room}
              onChange={(event) => setRoom(event.target.value)}
              className="field"
              aria-label="Filter by room"
            >
              <option value="">All rooms</option>
              {rooms.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>

            <select
              value={item}
              onChange={(event) => setItem(event.target.value)}
              className="field"
              aria-label="Filter by item"
            >
              <option value="">All items</option>
              {items.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>

            <select
              value={roomType}
              onChange={(event) => setRoomType(event.target.value)}
              className="field"
              aria-label="Filter by room type"
            >
              <option value="">All room types</option>
              {roomTypes.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>

            <select
              value={flag}
              onChange={(event) => setFlag(event.target.value as FlagKey)}
              className="field col-span-2 sm:col-span-1"
              aria-label="Filter by register health"
            >
              <option value="">Any status</option>
              <option value="missing-serial">Missing serial number</option>
              <option value="qr-pending">QR sticker pending</option>
              <option value="flagged">Spare / inactive</option>
            </select>
          </div>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.clear}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-ink-800"
                >
                  {filter.label}
                  <CloseIcon className="h-3 w-3 opacity-70" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="ml-1 text-[11px] font-semibold text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
          <p className="text-xs text-ink-500">
            <span className="font-semibold text-ink-900">
              {formatNumber(sorted.length)}
            </span>{" "}
            rows ·{" "}
            <span className="font-semibold text-ink-900">
              {formatNumber(totalUnits)}
            </span>{" "}
            units
            {sorted.length !== assets.length ? (
              <span className="text-ink-400">
                {" "}
                of {formatNumber(assets.length)} total
              </span>
            ) : null}
          </p>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span className="hidden sm:inline">Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs"
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="nice-scroll overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/60">
                <th className="px-4 py-2.5 text-left">
                  <SortButton
                    label="Item"
                    sortKey="item"
                    sort={sort}
                    onSort={handleSort}
                  />
                </th>
                <th className="w-20 px-4 py-2.5 text-right">
                  <SortButton
                    label="Qty"
                    sortKey="qty"
                    sort={sort}
                    onSort={handleSort}
                    align="right"
                  />
                </th>
                <th className="px-4 py-2.5 text-left">
                  <SortButton
                    label="Room"
                    sortKey="room"
                    sort={sort}
                    onSort={handleSort}
                  />
                </th>
                <th className="w-40 px-4 py-2.5 text-left">
                  <SortButton
                    label="Floor"
                    sortKey="floor"
                    sort={sort}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-2.5 text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                    Serial / model
                  </span>
                </th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const notes = `${row.serialNo ?? ""} ${row.modelNo ?? ""}`;
                const qrPending = QR_PATTERN.test(notes);

                return (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    onClick={() => setSelected(row)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelected(row);
                      }
                    }}
                    className="group cursor-pointer border-b border-ink-50 transition last:border-0 hover:bg-ink-50/70 focus:bg-ink-50/70 focus:outline-none"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium leading-snug text-ink-900">
                        {row.itemName}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-400">
                        {row.id} · {row.roomType}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-lg bg-ink-50 px-2 py-1 text-xs font-semibold tabular-nums text-ink-800 group-hover:bg-white">
                        {formatNumber(row.quantity)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] leading-snug text-ink-700">
                        {row.room}
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-400">
                        {row.subLocation !== row.floor
                          ? row.subLocation
                          : row.roomType}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Pill>{row.floor}</Pill>
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      {qrPending ? (
                        <Pill tone="gold">QR pending</Pill>
                      ) : row.serialNo ? (
                        <span className="block truncate font-mono text-[11px] text-ink-600">
                          {row.serialNo}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                      {row.modelNo ? (
                        <span className="mt-0.5 block truncate text-[10px] text-ink-400">
                          Model · {row.modelNo}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-3">
                      <ChevronRightIcon className="h-4 w-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-500" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageRows.length === 0 ? (
          <EmptyState
            title="No assets match those filters"
            description="Try widening the search, or clear the filters to see all 1,332 records."
            action={
              <button type="button" onClick={clearAll} className="btn-ghost text-xs">
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
            <p className="text-xs text-ink-500">
              Showing{" "}
              <span className="font-semibold text-ink-800">
                {formatNumber(startIndex + 1)}–
                {formatNumber(startIndex + pageRows.length)}
              </span>{" "}
              of {formatNumber(sorted.length)}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 transition hover:border-ink-300 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 text-xs tabular-nums text-ink-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 transition hover:border-ink-300 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <AssetDrawer
        asset={selected}
        roomSlug={selected ? roomSlugs[selected.room] : undefined}
        siblings={
          selected ? assets.filter((row) => row.room === selected.room) : []
        }
        onClose={() => setSelected(null)}
        onFilterRoom={(value) => {
          setRoom(value);
          setFloor("");
          setItem("");
          setSelected(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onFilterItem={(value) => {
          setItem(value);
          setFloor("");
          setRoom("");
          setSelected(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
