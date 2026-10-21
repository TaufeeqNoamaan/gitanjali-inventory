import { PageHeader, StatCard } from "@/components/ui/primitives";
import { RoomsGrid } from "@/components/rooms/rooms-grid";
import { buildRoomSummaries, getAssets, summarizeAssets } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { BuildingIcon, DoorIcon, LayersIcon } from "@/components/icons";

export const metadata = { title: "Rooms" };

export default async function RoomsPage() {
  const assets = await getAssets();
  const stats = summarizeAssets(assets);
  const rooms = buildRoomSummaries(assets);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="By location"
        title="Rooms"
        description="Walk the campus floor by floor — every room, what it holds, and how many units are counted inside."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Rooms"
          value={stats.roomCount}
          hint="Distinct rooms across the campus"
          icon={<DoorIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Floors"
          value={stats.floorCount}
          hint="Including cellar, MP hall and outdoor areas"
          icon={<BuildingIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Average per room"
          value={formatNumber(stats.avgUnitsPerRoom)}
          hint="Units per room, averaged across campus"
          icon={<LayersIcon className="h-5 w-5" />}
        />
      </div>

      <RoomsGrid rooms={rooms} />
    </div>
  );
}
