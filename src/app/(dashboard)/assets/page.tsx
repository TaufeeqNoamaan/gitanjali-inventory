import { AssetExplorer } from "@/components/assets/asset-explorer";
import { buildRoomSlugMap, getAssets } from "@/lib/data";

export const metadata = { title: "Asset register" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [assets, params] = await Promise.all([getAssets(), searchParams]);

  const initial = {
    query: first(params.q),
    floor: first(params.floor),
    room: first(params.room),
    item: first(params.item),
    roomType: first(params.roomType),
    flag: first(params.flag),
  };

  const filterKey = [
    initial.query,
    initial.floor,
    initial.room,
    initial.item,
    initial.roomType,
    initial.flag,
  ].join("|");

  return (
    <AssetExplorer
      key={filterKey}
      assets={assets}
      roomSlugs={buildRoomSlugMap(assets)}
      initial={initial}
    />
  );
}
