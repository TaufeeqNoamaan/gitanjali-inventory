import Link from "next/link";
import { notFound } from "next/navigation";

import { BarChart } from "@/components/charts/bar-chart";
import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  DoorIcon,
  LayersIcon,
  QrIcon,
  TagIcon,
} from "@/components/icons";
import {
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/ui/primitives";
import { PrintButton } from "@/components/print-button";
import { PrintHeader, PrintSignature } from "@/components/print";
import { getAssets, getItemBySlug, buildRoomSlugMap } from "@/lib/data";
import { formatNumber, percent } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const assets = await getAssets();
  const item = getItemBySlug(assets, slug);
  return { title: item ? item.name : "Item not found" };
}

export default async function ItemDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const assets = await getAssets();
  const item = getItemBySlug(assets, slug);

  if (!item) notFound();

  const rows = assets
    .filter((asset) => asset.itemName === item.name)
    .sort((a, b) => b.quantity - a.quantity);

  const byFloor = new Map<string, number>();
  for (const row of rows) {
    byFloor.set(row.floor, (byFloor.get(row.floor) ?? 0) + row.quantity);
  }
  const floorBars = item.floors.map((floor) => ({
    label: floor,
    value: byFloor.get(floor) ?? 0,
  }));

  const serials = rows
    .flatMap((row) =>
      row.serialNo
        ? row.serialNo
            .split(/[\n,]/)
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [],
    )
    .slice(0, 40);

  const serialisedRows = rows.filter((row) => row.serialNo).length;
  const roomSlugs = buildRoomSlugMap(assets);

  return (
    <div className="space-y-6">
      <PrintHeader
        title={item.name}
        subtitle={`${formatNumber(item.units)} units across ${formatNumber(
          item.rooms,
        )} rooms on ${formatNumber(item.floors.length)} floors`}
        meta={`Serials recorded on ${formatNumber(serialisedRows)} of ${formatNumber(
          item.records,
        )} entries`}
      />

      <div className="no-print">
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-ink-400">
          <Link href="/items" className="hover:text-ink-700">
            Item catalogue
          </Link>
          <ChevronRightIcon className="h-3 w-3" />
          <span className="text-ink-700">{item.name}</span>
        </nav>

        <PageHeader
          eyebrow="Item profile"
          title={item.name}
          description={`${formatNumber(item.units)} units spread across ${formatNumber(
            item.rooms,
          )} rooms on ${formatNumber(item.floors.length)} floors.`}
          actions={
            <>
              <PrintButton />
              <Link
                href={`/assets?item=${encodeURIComponent(item.name)}`}
                className="btn-ghost"
              >
                <ArrowUpRightIcon className="h-4 w-4" />
                Open in register
              </Link>
            </>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total units"
          value={item.units}
          hint="Sum of all quantities"
          icon={<LayersIcon className="h-5 w-5" />}
          accent
        />
        <StatCard
          label="Rooms"
          value={item.rooms}
          hint="Where this item is recorded"
          icon={<DoorIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Line items"
          value={item.records}
          hint="Register rows for this item"
          icon={<TagIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Serialised"
          value={serialisedRows}
          hint={`${percent(serialisedRows, item.records)}% of rows carry a serial`}
          icon={<QrIcon className="h-5 w-5" />}
        />
      </div>
      <SectionCard
        title="Units by floor"
        description="Bar chart — where this item is concentrated across the building"
        bodyClassName="pt-4"
      >
        <BarChart data={floorBars} unitLabel="units" height={230} />
      </SectionCard>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard
          title="Where it lives"
          description="Quantity per room, highest first"
          bodyClassName="p-0"
        >
          <div className="nice-scroll overflow-x-auto">
            <table className="w-full min-w-0 border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 sm:px-5">
                    Room
                  </th>
                  <th className="w-16 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 sm:w-20 sm:px-4">
                    Qty
                  </th>
                  <th className="hidden px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 sm:table-cell">
                    Serial
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50"
                  >
                    <td className="px-4 py-3 sm:px-5">
                      <Link
                        href={`/rooms/${roomSlugs[row.room] ?? ""}`}
                        className="font-medium text-ink-900 hover:underline"
                      >
                        {row.room}
                      </Link>
                      <p className="mt-0.5 text-[10px] text-ink-400">
                        {row.floor} · {row.roomType}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-ink-500 sm:hidden">
                        {row.serialNo ?? "No serial"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-semibold tabular-nums text-ink-800 sm:px-4">
                      {formatNumber(row.quantity)}
                    </td>
                    <td className="hidden max-w-[220px] px-4 py-3 sm:table-cell">
                      {row.serialNo ? (
                        <span className="block truncate font-mono text-[11px] text-ink-600">
                          {row.serialNo}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Recorded serials"
            description="First 40 serial numbers found in the register"
          >
            {serials.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink-200 px-3 py-4 text-center text-xs text-ink-400">
                No serial numbers recorded for this item yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {serials.map((serial) => (
                  <span
                    key={serial}
                    className="rounded-md bg-ink-50 px-2 py-1 font-mono text-[10px] text-ink-600"
                  >
                    {serial}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <PrintSignature label="Counted by" />
    </div>
  );
}
