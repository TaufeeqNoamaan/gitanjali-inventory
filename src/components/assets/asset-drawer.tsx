"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CheckIcon, CloseIcon, CopyIcon, DoorIcon, QrIcon } from "@/components/icons";
import { Pill } from "@/components/ui/primitives";
import type { Asset } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/50 px-3 py-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        {label}
      </dt>
      <dd className="mt-1 text-[13px] font-medium leading-snug text-ink-900">
        {value}
      </dd>
    </div>
  );
}

export function AssetDrawer({
  asset,
  roomSlug,
  siblings,
  onClose,
  onFilterRoom,
  onFilterItem,
}: {
  asset: Asset | null;
  roomSlug?: string;
  siblings: Asset[];
  onClose: () => void;
  onFilterRoom: (room: string) => void;
  onFilterItem: (item: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!asset) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [asset, onClose]);

  useEffect(() => {
    setCopied(false);
  }, [asset?.id]);

  if (!asset) return null;

  const notes = `${asset.serialNo ?? ""} ${asset.modelNo ?? ""}`;
  const qrPending = /TO PUT QR|QR TAIR/i.test(notes);
  const flagged = /NOT WORKING|SPAIR|OLD IN USE/i.test(notes);

  const copyDetails = async () => {
    const text = [
      `${asset.itemName} (Qty ${asset.quantity})`,
      `Record: ${asset.id}`,
      `Location: ${asset.location} · ${asset.subLocation}`,
      `Room: ${asset.room} (${asset.floor}, ${asset.roomType})`,
      `Serial no: ${asset.serialNo ?? "—"}`,
      `Model no: ${asset.modelNo ?? "—"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const roomSiblings = siblings
    .filter((row) => row.id !== asset.id)
    .sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="fixed inset-0 z-50 flex justify-end print:hidden">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink-950/40 backdrop-blur-[2px] animate-fade-in"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${asset.itemName} details`}
        className="nice-scroll relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-lift animate-slide-in"
      >
        <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label">Record {asset.id}</p>
              <h2 className="mt-1 font-display text-xl leading-tight text-ink-950">
                {asset.itemName}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-50 hover:text-ink-800"
              aria-label="Close"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="ink">{asset.floor}</Pill>
            <Pill>{asset.roomType}</Pill>
            {qrPending ? (
              <Pill tone="gold">
                <QrIcon className="h-3 w-3" />
                QR pending
              </Pill>
            ) : null}
            {flagged ? <Pill tone="danger">Needs review</Pill> : null}
          </div>
        </header>

        <div className="space-y-5 px-5 py-5">
          <div className="flex items-end justify-between gap-3 rounded-2xl bg-ink-950 px-4 py-4 text-white">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                Quantity on record
              </p>
              <p className="mt-1 font-display text-3xl leading-none">
                {formatNumber(asset.quantity)}
              </p>
            </div>
            <p className="max-w-[9rem] text-right text-[11px] leading-relaxed text-ink-300">
              {asset.location} · {asset.subLocation}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-2">
            <Field label="Room" value={asset.room} />
            <Field label="Floor" value={asset.floor} />
            <Field
              label="Serial no"
              value={
                asset.serialNo ? (
                  <span className="break-words font-mono text-xs">
                    {asset.serialNo}
                  </span>
                ) : (
                  <span className="text-ink-300">Not recorded</span>
                )
              }
            />
            <Field
              label="Model no"
              value={
                asset.modelNo ? (
                  <span className="break-words font-mono text-xs">
                    {asset.modelNo}
                  </span>
                ) : (
                  <span className="text-ink-300">Not recorded</span>
                )
              }
            />
            <Field label="Sub location" value={asset.subLocation || "—"} />
            <Field label="Room type" value={asset.roomType} />
          </dl>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDetails}
              className="btn-ghost flex-1 text-xs"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <CopyIcon className="h-3.5 w-3.5" />
                  Copy details
                </>
              )}
            </button>
            <Link
              href={`/rooms/${roomSlug ?? ""}`}
              className="btn-ghost flex-1 text-xs"
            >
              <DoorIcon className="h-3.5 w-3.5" />
              Room profile
            </Link>
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                Other items in this room
              </h3>
              <span className="text-[11px] text-ink-400">
                {roomSiblings.length} rows
              </span>
            </div>

            {roomSiblings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink-200 px-3 py-4 text-center text-xs text-ink-400">
                This is the only record for {asset.room}.
              </p>
            ) : (
              <ul className="divide-y divide-ink-50 rounded-xl border border-ink-100">
                {roomSiblings.slice(0, 10).map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onFilterItem(row.itemName)}
                        className="block truncate text-left text-[13px] font-medium text-ink-800 hover:text-ink-950 hover:underline"
                      >
                        {row.itemName}
                      </button>
                      <span className="mt-0.5 block truncate font-mono text-[10px] text-ink-400">
                        {row.serialNo ?? "no serial"} · {row.id}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-md bg-ink-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-600">
                      {formatNumber(row.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => onFilterRoom(asset.room)}
              className={cn(
                "mt-3 w-full rounded-xl border border-dashed border-ink-200 px-3 py-2 text-[11px] font-semibold text-ink-500 transition",
                "hover:border-ink-300 hover:bg-ink-50 hover:text-ink-800",
              )}
            >
              Show all rows for {asset.room}
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}
