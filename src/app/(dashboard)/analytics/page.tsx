import Link from "next/link";

import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { ArrowUpRightIcon, ChartIcon, LayersIcon, QrIcon, TagIcon } from "@/components/icons";
import {
  BarList,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/ui/primitives";
import { PrintButton } from "@/components/print-button";
import { PrintHeader } from "@/components/print";
import {
  buildItemSummaries,
  buildRoomSummaries,
  getAssets,
  summarizeAssets,
} from "@/lib/data";
import { formatNumber, percent } from "@/lib/utils";

export const metadata = { title: "Analytics" };

const QUANTITY_BUCKETS = [
  { label: "1 unit", min: 1, max: 1 },
  { label: "2–5", min: 2, max: 5 },
  { label: "6–20", min: 6, max: 20 },
  { label: "21–50", min: 21, max: 50 },
  { label: "51–100", min: 51, max: 100 },
  { label: "100+", min: 101, max: Number.POSITIVE_INFINITY },
];

export default async function AnalyticsPage() {
  const assets = await getAssets();
  const stats = summarizeAssets(assets);
  const rooms = buildRoomSummaries(assets);
  const items = buildItemSummaries(assets);

  const quantities = assets.map((asset) => asset.quantity).sort((a, b) => a - b);
  const medianQuantity =
    quantities.length > 0
      ? quantities[Math.floor((quantities.length - 1) / 2)]
      : 0;
  const largestQuantity = quantities[quantities.length - 1] ?? 0;
  const serialCoverage = percent(stats.health.serialised, stats.totalRecords);

  const floorData = stats.byFloor.map((floor) => ({
    label: floor.label,
    value: floor.units,
  }));

  const roomTypePie = stats.byRoomType
    .slice(0, 7)
    .map((entry) => ({ label: entry.label, value: entry.units }));
  const otherRoomTypeUnits = stats.byRoomType
    .slice(7)
    .reduce((sum, entry) => sum + entry.units, 0);
  if (otherRoomTypeUnits > 0) {
    roomTypePie.push({ label: "Other types", value: otherRoomTypeUnits });
  }

  let running = 0;
  const paretoPoints = items.slice(0, 20).map((item, index) => {
    running += item.units;
    return {
      label: `#${index + 1}`,
      value: Math.round((running / stats.totalUnits) * 1000) / 10,
      meta: `${item.name} · ${formatNumber(item.units)} units`,
    };
  });

  const shareOfTop = (count: number) =>
    percent(
      items.slice(0, count).reduce((sum, item) => sum + item.units, 0),
      stats.totalUnits,
    );

  const distribution = QUANTITY_BUCKETS.map((bucket) => {
    const entries = assets.filter(
      (asset) =>
        asset.quantity >= bucket.min && asset.quantity <= bucket.max,
    );
    return {
      label: bucket.label,
      value: entries.length,
    };
  });

  const busiestRooms = [...rooms].sort((a, b) => b.units - a.units).slice(0, 10);
  const topItems = items.slice(0, 10);

  return (
    <div className="space-y-6">
      <PrintHeader
        title="Analytics"
        subtitle="Asset distribution by floor, room type and item"
        meta={`${formatNumber(stats.totalUnits)} units · ${formatNumber(
          stats.totalRecords,
        )} entries · ${formatNumber(stats.roomCount)} rooms`}
      />

      <div className="no-print">
        <PageHeader
          eyebrow="Insights"
          title="Analytics"
          description="How the register is distributed — by floor, room type, item and record size."
          actions={
            <>
              <PrintButton />
              <Link href="/assets" className="btn-ghost">
                Open register
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average per room"
          value={stats.avgUnitsPerRoom}
          hint={`Units per room across ${stats.roomCount} rooms`}
          icon={<LayersIcon className="h-5 w-5" />}
          accent
        />
        <StatCard
          label="Median record"
          value={`${formatNumber(medianQuantity)} ${
            medianQuantity === 1 ? "unit" : "units"
          }`}
          hint="Half of all entries hold this many units or fewer"
          icon={<ChartIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Largest record"
          value={`${formatNumber(largestQuantity)} ${
            largestQuantity === 1 ? "unit" : "units"
          }`}
          hint="Highest quantity recorded on a single entry"
          icon={<TagIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Serial coverage"
          value={`${serialCoverage}%`}
          hint={`${formatNumber(stats.health.serialised)} of ${formatNumber(
            stats.totalRecords,
          )} entries carry a serial or tag`}
          icon={<QrIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2 break-inside-avoid"
          title="Units by floor"
          description="Bar chart — every recorded unit grouped by level"
          bodyClassName="pt-4"
        >
          <BarChart data={floorData} unitLabel="units" />
        </SectionCard>

        <SectionCard
          className="break-inside-avoid"
          title="Share by room type"
          description="Pie chart — where the units physically sit"
          bodyClassName="pt-6"
        >
          <PieChart data={roomTypePie} unitLabel="units" />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2 break-inside-avoid"
          title="Inventory concentration"
          description="Line chart — cumulative share of units held by the top 20 item types"
          bodyClassName="pt-4"
        >
          <LineChart
            points={paretoPoints}
            max={100}
            suffix="%"
            unitLabel="share of units"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-ink-400 sm:hidden">
            Item rank 1–20 along the x-axis; the highlighted point is the top 20
            together — {paretoPoints[paretoPoints.length - 1]?.value}% of every
            unit on campus.
          </p>
        </SectionCard>

        <SectionCard
          className="break-inside-avoid"
          title="What that means"
          description="A small catalogue drives most of the count"
        >
          <dl className="space-y-3">
            {[
              {
                label: "Top 5 item types",
                value: `${shareOfTop(5)}%`,
                detail: "of all units on campus",
              },
              {
                label: "Top 10 item types",
                value: `${shareOfTop(10)}%`,
                detail: "of all units on campus",
              },
              {
                label: "Top 20 item types",
                value: `${shareOfTop(20)}%`,
                detail: "of all units on campus",
              },
            ].map((entry) => (
              <div
                key={entry.label}
                className="rounded-xl border border-ink-100 bg-ink-50/50 px-3.5 py-3"
              >
                <dt className="flex items-center justify-between gap-3 text-[11px] font-semibold text-ink-500">
                  {entry.label}
                  <span className="font-display text-xl leading-none text-ink-950">
                    {entry.value}
                  </span>
                </dt>
                <dd className="mt-1 text-[11px] text-ink-400">{entry.detail}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
            The remaining {formatNumber(stats.itemCount - 20)} item types make up
            the long tail — mostly low-volume fittings and spares.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        className="break-inside-avoid"
        title="Record size distribution"
          description="Bar chart — how many entries hold 1 unit, 2–5 units, and so on"
          bodyClassName="pt-4"
        >
          <BarChart
            data={distribution}
            unitLabel="entries"
        />
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          className="break-inside-avoid"
          title="Top rooms by units"
          description="Horizontal bars — the heaviest rooms on campus"
          action={
            <Link
              href="/rooms"
              className="text-[11px] font-semibold text-ink-500 hover:text-ink-900"
            >
              All rooms
            </Link>
          }
        >
          <BarList
            items={busiestRooms.map((room) => ({
              label: room.room,
              value: room.units,
              href: `/rooms/${room.slug}`,
              meta: `${room.floor} · ${room.roomType}`,
            }))}
            total={stats.totalUnits}
          />
        </SectionCard>

        <SectionCard
          className="break-inside-avoid"
          title="Top items by units"
          description="Horizontal bars — the most numerous assets"
          action={
            <Link
              href="/items"
              className="text-[11px] font-semibold text-ink-500 hover:text-ink-900"
            >
              Catalogue
            </Link>
          }
        >
          <BarList
            items={topItems.map((item) => ({
              label: item.name,
              value: item.units,
              href: `/items/${item.slug}`,
              meta: `${formatNumber(item.rooms)} rooms`,
            }))}
            total={stats.totalUnits}
          />
        </SectionCard>
      </div>
    </div>
  );
}
