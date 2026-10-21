import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  DoorIcon,
  LayersIcon,
  QrIcon,
  TagIcon,
} from "@/components/icons";
import { PageHeader, Pill, SectionCard, StatCard } from "@/components/ui/primitives";
import {
  buildItemSlugMap,
  buildRoomSummaries,
  getAssets,
  getRoomBySlug,
} from "@/lib/data";
import { formatNumber, percent } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const assets = await getAssets();
  const room = getRoomBySlug(assets, slug);
  return { title: room ? room.room : "Room not found" };
}

export default async function RoomDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const assets = await getAssets();
  const room = getRoomBySlug(assets, slug);

  if (!room) notFound();

  const rows = assets
    .filter((asset) => asset.room === room.room)
    .sort((a, b) => b.quantity - a.quantity);

  const itemSlugs = buildItemSlugMap(assets);
  const rooms = buildRoomSummaries(assets);
  const floorRooms = rooms.filter(
    (entry) => entry.floor === room.floor && entry.slug !== room.slug,
  );

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-ink-400">
        <Link href="/rooms" className="hover:text-ink-700">
          Rooms
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <Link
          href="/rooms"
          className="hover:text-ink-700"
        >
          {room.floor}
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-ink-700">{room.room}</span>
      </nav>

      <PageHeader
        eyebrow={`${room.floor} · ${room.roomType}`}
        title={room.room}
        description={`${formatNumber(room.units)} units across ${formatNumber(
          room.itemTypes,
        )} item types in this room.`}
        actions={
          <Link
            href={`/assets?room=${encodeURIComponent(room.room)}`}
            className="btn-ghost"
          >
            <ArrowUpRightIcon className="h-4 w-4" />
            Open in register
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Units in room"
          value={room.units}
          hint={`Counted across ${rows.length} register rows`}
          icon={<LayersIcon className="h-5 w-5" />}
          accent
        />
        <StatCard
          label="Item types"
          value={room.itemTypes}
          hint="Distinct items recorded here"
          icon={<TagIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Serialised rows"
          value={room.serialised}
          hint={`${percent(room.serialised, room.records)}% of rows carry a serial`}
          icon={<QrIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Room type"
          value={room.roomType}
          hint={`${room.floor} · ${rows[0]?.subLocation ?? "Devakul"}`}
          icon={<DoorIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard
          title="Assets in this room"
          description="Ordered by quantity — high-value counts first"
          bodyClassName="p-0"
        >
          <div className="nice-scroll overflow-x-auto">
            <table className="w-full min-w-0 border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 sm:px-5">
                    Item
                  </th>
                  <th className="w-16 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 sm:w-20 sm:px-4">
                    Qty
                  </th>
                  <th className="hidden px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 sm:table-cell">
                    Serial / model
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
                        href={`/items/${itemSlugs[row.itemName] ?? ""}`}
                        className="font-medium text-ink-900 hover:underline"
                      >
                        {row.itemName}
                      </Link>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-400">
                        {row.id}
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
                      {row.modelNo ? (
                        <span className="mt-0.5 block truncate text-[10px] text-ink-400">
                          Model · {row.modelNo}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title={`Elsewhere on ${room.floor}`}
            description="Other rooms on the same level"
            bodyClassName="py-2"
          >
            {floorRooms.length === 0 ? (
              <p className="py-3 text-xs text-ink-400">
                This is the only room recorded on this floor.
              </p>
            ) : (
              <ul className="divide-y divide-ink-50">
                {floorRooms.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/rooms/${entry.slug}`}
                      className="group flex items-center justify-between gap-3 py-2.5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink-800 group-hover:text-ink-950">
                          {entry.room}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-ink-400">
                          {entry.roomType}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] font-semibold tabular-nums text-ink-500">
                        {formatNumber(entry.units)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Room facts" description="As recorded in the register">
            <dl className="space-y-2.5 text-xs">
              {[
                ["Location", rows[0]?.location ?? "Devakul"],
                ["Sub location", rows[0]?.subLocation ?? "—"],
                ["Floor", room.floor],
                ["Room type", room.roomType],
                ["Line items", formatNumber(room.records)],
                ["Units", formatNumber(room.units)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-ink-400">{label}</dt>
                  <dd className="text-right font-medium text-ink-800">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink-50 pt-3">
              <Pill tone="gold">{room.roomType}</Pill>
              <Pill>{room.floor}</Pill>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
