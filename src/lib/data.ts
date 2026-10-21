import "server-only";

import { cache } from "react";

import snapshot from "@/data/assets.json";
import { FLOOR_ORDER, normaliseAsset } from "./normalize";
import type {
  Asset,
  FloorBreakdown,
  InventoryStats,
  ItemSummary,
  RegisterHealth,
  RoomSummary,
  RoomTypeBreakdown,
} from "./types";
import { percent, slugify } from "./utils";

/* -------------------------------------------------------------------------- */
/*  Data source                                                               */
/* -------------------------------------------------------------------------- */

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME ?? "Sheet1";
const SHEET_CSV_URL = process.env.GOOGLE_SHEET_CSV_URL;
const REVALIDATE_SECONDS = Number(process.env.SHEET_REVALIDATE_SECONDS ?? 300);

export const dataSource = SHEET_ID || SHEET_CSV_URL ? "google-sheets" : "snapshot";

export const dataSourceLabel =
  dataSource === "google-sheets" ? "Google Sheets (live)" : "Local snapshot";

const HEADER_ALIASES: Record<keyof Asset, string[]> = {
  id: ["ID", "RECORD ID"],
  itemName: ["ITEM NAME", "ITEM", "ASSET", "ASSET NAME"],
  quantity: ["QTY", "QUANTITY", "QTY."],
  serialNo: ["SERIAL NO", "SERIAL NUMBER", "SERIAL"],
  modelNo: ["MODEL NO", "MODEL", "MODEL NUMBER"],
  location: ["LOCATION", "SITE", "CAMPUS"],
  subLocation: ["SUB LOCATION", "SUBLOCATION", "BLOCK"],
  room: ["PRESENT ALLOTED ROOM", "PRESENT ALLOTTED ROOM", "ROOM", "ALLOTTED ROOM"],
  floor: ["FLOOR"],
  roomType: ["ROOM TYPE", "TYPE"],
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

function mapHeader(header: string[]): Partial<Record<keyof Asset, number>> {
  const index: Partial<Record<keyof Asset, number>> = {};
  const normalised = header.map((cell) =>
    cell.replace(/\s+/g, " ").trim().toUpperCase(),
  );

  (Object.keys(HEADER_ALIASES) as (keyof Asset)[]).forEach((key) => {
    for (const alias of HEADER_ALIASES[key]) {
      const found = normalised.findIndex(
        (cell) => cell === alias || cell.startsWith(`${alias} `),
      );
      if (found >= 0 && index[key] === undefined) {
        index[key] = found;
      }
    }
  });

  return index;
}

function rowsToAssets(rows: string[][]): Asset[] {
  if (rows.length === 0) return [];
  const headerIndex = mapHeader(rows[0]);

  return rows.slice(1).map((cells, rowIndex) => {
    const value = (key: keyof Asset) => {
      const position = headerIndex[key];
      return position === undefined ? null : cells[position] ?? null;
    };

    return normaliseAsset(
      {
        id: value("id") ?? undefined,
        itemName: value("itemName"),
        quantity: value("quantity"),
        serialNo: value("serialNo"),
        modelNo: value("modelNo"),
        location: value("location"),
        subLocation: value("subLocation"),
        room: value("room"),
      },
      rowIndex,
    );
  });
}

function sheetCsvUrl(): string | null {
  if (SHEET_CSV_URL) return SHEET_CSV_URL;
  if (!SHEET_ID) return null;
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    SHEET_NAME,
  )}`;
}

const snapshotAssets = (snapshot as Array<Partial<Asset>>).map((row, index) =>
  normaliseAsset(
    {
      id: row.id,
      itemName: row.itemName,
      quantity: row.quantity,
      serialNo: row.serialNo,
      modelNo: row.modelNo,
      location: row.location,
      subLocation: row.subLocation,
      room: row.room,
    },
    index,
  ),
);

export const getAssets = cache(async (): Promise<Asset[]> => {
  const url = sheetCsvUrl();
  if (!url) return snapshotAssets;

  try {
    const response = await fetch(url, {
      next: { revalidate: Number.isFinite(REVALIDATE_SECONDS) ? REVALIDATE_SECONDS : 300 },
    });

    if (!response.ok) {
      console.warn(
        `[inventory] Google Sheet request failed (${response.status}); using local snapshot.`,
      );
      return snapshotAssets;
    }

    const parsed = parseCsv(await response.text());
    const hasItemColumn = parsed[0]?.some((cell) =>
      /item\s*name/i.test(cell),
    );
    const assets = rowsToAssets(parsed);

    if (assets.length > 0 && hasItemColumn) {
      if (process.env.NODE_ENV !== "production") {
        console.info(
          `[inventory] ${assets.length} rows loaded from Google Sheets`,
        );
      }
      return assets;
    }

    console.warn(
      "[inventory] Google Sheet response was not a recognisable asset table; using local snapshot.",
    );
    return snapshotAssets;
  } catch (error) {
    console.warn("[inventory] Google Sheet unreachable; using local snapshot.", error);
    return snapshotAssets;
  }
});

/* -------------------------------------------------------------------------- */
/*  Aggregations                                                              */
/* -------------------------------------------------------------------------- */

function sortFloors(floors: string[]): string[] {
  return [...floors].sort(
    (a, b) => FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b),
  );
}

function uniqueSlug(base: string, used: Set<string>): string {
  const root = base || "record";
  let candidate = root;
  let counter = 2;
  while (used.has(candidate)) {
    candidate = `${root}-${counter}`;
    counter += 1;
  }
  used.add(candidate);
  return candidate;
}

export function summarizeAssets(assets: Asset[]): InventoryStats {
  const totalUnits = assets.reduce((sum, asset) => sum + asset.quantity, 0);
  const rooms = new Map<string, number>();
  const items = new Set<string>();

  for (const asset of assets) {
    rooms.set(asset.room, (rooms.get(asset.room) ?? 0) + asset.quantity);
    items.add(asset.itemName);
  }

  const floorUnits = new Map<string, { units: number; records: number }>();
  const roomTypeUnits = new Map<
    string,
    { units: number; records: number; rooms: Set<string> }
  >();

  for (const asset of assets) {
    const floor = floorUnits.get(asset.floor) ?? { units: 0, records: 0 };
    floor.units += asset.quantity;
    floor.records += 1;
    floorUnits.set(asset.floor, floor);

    const type = roomTypeUnits.get(asset.roomType) ?? {
      units: 0,
      records: 0,
      rooms: new Set<string>(),
    };
    type.units += asset.quantity;
    type.records += 1;
    type.rooms.add(asset.room);
    roomTypeUnits.set(asset.roomType, type);
  }

  const byFloor: FloorBreakdown[] = sortFloors([...floorUnits.keys()]).map(
    (label) => {
      const entry = floorUnits.get(label)!;
      return {
        label,
        units: entry.units,
        records: entry.records,
        share: percent(entry.units, totalUnits),
      };
    },
  );

  const byRoomType: RoomTypeBreakdown[] = [...roomTypeUnits.entries()]
    .map(([label, entry]) => ({
      label,
      units: entry.units,
      records: entry.records,
      rooms: entry.rooms.size,
      share: percent(entry.units, totalUnits),
    }))
    .sort((a, b) => b.units - a.units);

  const largest = [...rooms.entries()].sort((a, b) => b[1] - a[1])[0];

  let serialised = 0;
  let qrPending = 0;
  let flagged = 0;

  for (const asset of assets) {
    const notes = `${asset.serialNo ?? ""} ${asset.modelNo ?? ""}`;
    if (asset.serialNo) serialised += 1;
    if (/TO PUT QR|QR TAIR/i.test(notes)) qrPending += 1;
    if (/NOT WORKING|SPAIR|OLD IN USE/i.test(notes)) flagged += 1;
  }

  const health: RegisterHealth = {
    totalRecords: assets.length,
    serialised,
    missingSerial: assets.length - serialised,
    qrPending,
    flagged,
  };

  return {
    totalUnits,
    totalRecords: assets.length,
    roomCount: rooms.size,
    itemCount: items.size,
    floorCount: byFloor.length,
    avgUnitsPerRoom: rooms.size ? Math.round(totalUnits / rooms.size) : 0,
    largestRoom: largest
      ? { name: largest[0], slug: slugify(largest[0]), units: largest[1] }
      : null,
    byFloor,
    byRoomType,
    health,
  };
}

export function buildRoomSummaries(assets: Asset[]): RoomSummary[] {
  const map = new Map<string, RoomSummary & { itemMap: Map<string, number> }>();

  for (const asset of assets) {
    let room = map.get(asset.room);
    if (!room) {
      room = {
        room: asset.room,
        slug: slugify(asset.room),
        floor: asset.floor,
        roomType: asset.roomType,
        units: 0,
        records: 0,
        itemTypes: 0,
        serialised: 0,
        topItems: [],
        itemMap: new Map<string, number>(),
      };
      map.set(asset.room, room);
    }

    room.units += asset.quantity;
    room.records += 1;
    if (asset.serialNo) room.serialised += 1;
    room.itemMap.set(
      asset.itemName,
      (room.itemMap.get(asset.itemName) ?? 0) + asset.quantity,
    );
  }

  const summaries = [...map.values()]
    .map(({ itemMap, ...room }) => ({
      ...room,
      slug: "",
      itemTypes: itemMap.size,
      topItems: [...itemMap.entries()]
        .map(([name, units]) => ({ name, units }))
        .sort((a, b) => b.units - a.units)
        .slice(0, 3),
    }))
    .sort((a, b) => {
      const floorDelta =
        FLOOR_ORDER.indexOf(a.floor) - FLOOR_ORDER.indexOf(b.floor);
      return floorDelta !== 0 ? floorDelta : a.room.localeCompare(b.room);
    });

  const used = new Set<string>();
  for (const room of summaries) {
    room.slug = uniqueSlug(slugify(room.room), used);
  }

  return summaries;
}

export function buildItemSummaries(assets: Asset[]): ItemSummary[] {
  const map = new Map<
    string,
    { units: number; records: number; rooms: Set<string>; floors: Set<string> }
  >();

  for (const asset of assets) {
    const entry = map.get(asset.itemName) ?? {
      units: 0,
      records: 0,
      rooms: new Set<string>(),
      floors: new Set<string>(),
    };
    entry.units += asset.quantity;
    entry.records += 1;
    entry.rooms.add(asset.room);
    entry.floors.add(asset.floor);
    map.set(asset.itemName, entry);
  }

  const summaries = [...map.entries()]
    .map(([name, entry]) => ({
      name,
      slug: "",
      units: entry.units,
      records: entry.records,
      rooms: entry.rooms.size,
      floors: sortFloors([...entry.floors]),
    }))
    .sort((a, b) => b.units - a.units || a.name.localeCompare(b.name));

  const used = new Set<string>();
  for (const item of summaries) {
    item.slug = uniqueSlug(slugify(item.name), used);
  }

  return summaries;
}

export function buildRoomSlugMap(assets: Asset[]): Record<string, string> {
  return buildRoomSummaries(assets).reduce<Record<string, string>>(
    (accumulator, room) => {
      accumulator[room.room] = room.slug;
      return accumulator;
    },
    {},
  );
}

export function buildItemSlugMap(assets: Asset[]): Record<string, string> {
  return buildItemSummaries(assets).reduce<Record<string, string>>(
    (accumulator, item) => {
      accumulator[item.name] = item.slug;
      return accumulator;
    },
    {},
  );
}

export function getRoomBySlug(assets: Asset[], slug: string) {
  return buildRoomSummaries(assets).find((room) => room.slug === slug) ?? null;
}

export function getItemBySlug(assets: Asset[], slug: string) {
  return buildItemSummaries(assets).find((item) => item.slug === slug) ?? null;
}
