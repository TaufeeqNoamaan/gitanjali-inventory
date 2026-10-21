import Link from "next/link";

import {
  AlertIcon,
  ArrowUpRightIcon,
  DoorIcon,
  LayersIcon,
  QrIcon,
  TagIcon,
} from "@/components/icons";
import {
  BarList,
  DonutChart,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/ui/primitives";
import {
  buildItemSummaries,
  buildRoomSummaries,
  getAssets,
  summarizeAssets,
} from "@/lib/data";
import { formatNumber, percent, pluralise } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

function HealthRow({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: "gold" | "danger" | "neutral";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "gold"
        ? "text-gold-700"
        : "text-ink-700";

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 border-b border-ink-50 py-2.5 last:border-0"
    >
      <span className="text-xs leading-relaxed text-ink-600 group-hover:text-ink-900">
        {label}
      </span>
      <span className="flex items-center gap-1.5">
        <span className={`text-sm font-semibold tabular-nums ${toneClass}`}>
          {formatNumber(value)}
        </span>
        <ArrowUpRightIcon className="h-3.5 w-3.5 text-ink-300 transition group-hover:text-ink-500" />
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const assets = await getAssets();
  const stats = summarizeAssets(assets);
  const rooms = buildRoomSummaries(assets);
  const items = buildItemSummaries(assets);

  const busiestRooms = [...rooms]
    .sort((a, b) => b.units - a.units)
    .slice(0, 6);
  const topItems = items.slice(0, 6);

  const donutData = stats.byRoomType
    .slice(0, 7)
    .map((entry) => ({ label: entry.label, value: entry.units }));
  const otherUnits = stats.byRoomType
    .slice(7)
    .reduce((sum, entry) => sum + entry.units, 0);
  if (otherUnits > 0) {
    donutData.push({ label: "Other types", value: otherUnits });
  }

  const serialCoverage = percent(stats.health.serialised, stats.totalRecords);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Devakul campus · 2026–27"
        title="Asset overview"
        description="A live read-out of everything the school owns, where it lives, and how well it is documented."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/analytics" className="btn-ghost">
              Analytics
            </Link>
            <Link href="/assets" className="btn-primary">
              Open register
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total units"
          value={stats.totalUnits}
          hint={`Spread across ${stats.roomCount} rooms on ${stats.floorCount} floors`}
          icon={<LayersIcon className="h-5 w-5" />}
          accent
        />
        <StatCard
          label="Line items"
          value={stats.totalRecords}
          hint="Item-level rows captured in the register"
          icon={<TagIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Rooms tracked"
          value={stats.roomCount}
          hint={
            stats.largestRoom
              ? `Largest: ${stats.largestRoom.name} · ${formatNumber(
                  stats.largestRoom.units,
                )} units`
              : "No rooms recorded yet"
          }
          icon={<DoorIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Item types"
          value={stats.itemCount}
          hint={`Averaging ${formatNumber(stats.avgUnitsPerRoom)} units per room`}
          icon={<LayersIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Assets by floor"
          description="Every recorded unit, grouped by the level it sits on"
          bodyClassName="pt-5"
        >
          <BarList
            items={stats.byFloor.map((floor) => ({
              label: floor.label,
              value: floor.units,
              meta: `${pluralise(floor.records, "line item")} · ${floor.share}% of campus`,
            }))}
            total={stats.totalUnits}
          />
        </SectionCard>

        <SectionCard
          title="Asset mix"
          description="Share of units by the kind of room they are in"
          bodyClassName="pt-6"
          action={
            <Link
              href="/analytics"
              className="text-[11px] font-semibold text-ink-500 hover:text-ink-900"
            >
              Analytics
            </Link>
          }
        >
          <DonutChart data={donutData} centerLabel="units" />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Busiest rooms"
          description="Rooms holding the most units"
          action={
            <Link
              href="/rooms"
              className="text-[11px] font-semibold text-ink-500 hover:text-ink-900"
            >
              All rooms
            </Link>
          }
          bodyClassName="py-2"
        >
          <ol className="divide-y divide-ink-50">
            {busiestRooms.map((room, index) => (
              <li key={room.slug}>
                <Link
                  href={`/rooms/${room.slug}`}
                  className="group flex items-center gap-3 py-2.5"
                >
                  <span className="w-5 shrink-0 text-[11px] font-semibold tabular-nums text-ink-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink-800 group-hover:text-ink-950">
                      {room.room}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink-400">
                      {room.floor} · {room.roomType}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-ink-50 px-2 py-1 text-[11px] font-semibold tabular-nums text-ink-600 group-hover:bg-ink-100">
                    {formatNumber(room.units)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          title="Most tracked items"
          description="Highest unit counts in the catalogue"
          action={
            <Link
              href="/items"
              className="text-[11px] font-semibold text-ink-500 hover:text-ink-900"
            >
              Catalogue
            </Link>
          }
          bodyClassName="py-2"
        >
          <ol className="divide-y divide-ink-50">
            {topItems.map((item, index) => (
              <li key={item.slug}>
                <Link
                  href={`/items/${item.slug}`}
                  className="group flex items-center gap-3 py-2.5"
                >
                  <span className="w-5 shrink-0 text-[11px] font-semibold tabular-nums text-ink-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink-800 group-hover:text-ink-950">
                      {item.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink-400">
                      {pluralise(item.rooms, "room")}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-ink-50 px-2 py-1 text-[11px] font-semibold tabular-nums text-ink-600 group-hover:bg-ink-100">
                    {formatNumber(item.units)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          title="Register health"
          description="Documentation gaps worth closing"
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-semibold text-gold-700">
              <AlertIcon className="h-3 w-3" />
              Review
            </span>
          }
          bodyClassName="py-3"
        >
          <div className="mb-3 rounded-xl bg-ink-50/80 px-3 py-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-ink-600">
              <span>Serial number coverage</span>
              <span className="tabular-nums">{serialCoverage}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-ink-800"
                style={{ width: `${Math.max(serialCoverage, 2)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-ink-400">
              {formatNumber(stats.health.serialised)} of{" "}
              {formatNumber(stats.totalRecords)} rows carry a serial or tag
            </p>
          </div>

          <HealthRow
            label="Rows without a serial number"
            value={stats.health.missingSerial}
            href="/assets?flag=missing-serial"
            tone="neutral"
          />
          <HealthRow
            label="QR stickers still to be applied"
            value={stats.health.qrPending}
            href="/assets?flag=qr-pending"
            tone="gold"
          />
          <HealthRow
            label="Spare / inactive equipment flagged"
            value={stats.health.flagged}
            href="/assets?flag=flagged"
            tone="danger"
          />

          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-ink-400">
            <QrIcon className="h-3.5 w-3.5" />
            Flagged rows open pre-filtered in the register
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
