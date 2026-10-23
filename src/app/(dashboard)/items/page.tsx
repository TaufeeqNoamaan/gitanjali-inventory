import { ItemCatalog } from "@/components/items/item-catalog";
import { LayersIcon, TagIcon } from "@/components/icons";
import { PrintButton } from "@/components/print-button";
import { PrintHeader } from "@/components/print";
import { PageHeader, StatCard } from "@/components/ui/primitives";
import { buildItemSummaries, getAssets, summarizeAssets } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Item catalogue" };

export default async function ItemsPage() {
  const assets = await getAssets();
  const stats = summarizeAssets(assets);
  const items = buildItemSummaries(assets);
  const leader = items[0];

  return (
    <div className="space-y-6">
      <PrintHeader
        title="Item catalogue"
        subtitle={`${formatNumber(stats.itemCount)} item types · ${formatNumber(
          stats.totalUnits,
        )} units across ${formatNumber(stats.roomCount)} rooms`}
      />

      <div className="no-print">
        <PageHeader
          eyebrow="By item"
          title="Item catalogue"
          description="Every distinct asset type the school tracks, with unit totals and the rooms they live in."
          actions={<PrintButton />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Item types"
          value={stats.itemCount}
          hint="Distinct assets in the catalogue"
          icon={<TagIcon className="h-5 w-5" />}
          accent
        />
        <StatCard
          label="Total units"
          value={stats.totalUnits}
          hint="Sum of every quantity on record"
          icon={<LayersIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Largest category"
          value={leader ? formatNumber(leader.units) : "—"}
          hint={leader ? `${leader.name} · ${leader.rooms} rooms` : "No data"}
          icon={<LayersIcon className="h-5 w-5" />}
        />
      </div>

      <ItemCatalog items={items} />
    </div>
  );
}
