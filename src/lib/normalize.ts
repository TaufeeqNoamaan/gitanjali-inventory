import type { Asset } from "./types";

const FLOOR_BY_SUB_LOCATION: Record<string, string> = {
  "DEVAKUL - CELLAR": "Cellar",
  CELLAR: "Cellar",
  "GROUND FLOOR": "Ground Floor",
  "DEVAKUL - GF FLOOR": "Ground Floor",
  "1ST FLOOR": "1st Floor",
  "2ND FLOOR": "2nd Floor",
  "3RD FLOOR": "3rd Floor",
  "4TH FLOOR": "4th Floor",
  "DEVAKUL - 4TH FLOOR": "4th Floor",
  "DEVAKUL - MP HALL": "MP Hall",
};

export const FLOOR_ORDER = [
  "Cellar",
  "Ground Floor",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor",
  "MP Hall",
  "Other",
];

export function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/\r/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

export function normaliseSubLocation(value: string | null): string {
  const text = clean(value) ?? "";
  const key = text.toUpperCase();
  if (FLOOR_BY_SUB_LOCATION[key]) return FLOOR_BY_SUB_LOCATION[key];
  return text;
}

const ROOM_FLOOR_PATTERNS: [RegExp, string][] = [
  [/^(CF|CELLER|CELLAR)\b/, "Cellar"],
  [/^GF\b/, "Ground Floor"],
  [/^1F\b/, "1st Floor"],
  [/^2F\b/, "2nd Floor"],
  [/^3F\b/, "3rd Floor"],
  [/^(4F|4TH)\b/, "4th Floor"],
];

const CLASSROOM = /(^|\s)(PP\s?\d?|NURSERY|\d{1,2})\s*-\s*[A-C]\b/;
const ADMIN_WORDS = [
  "PRINCIPAL",
  "FOUNDER",
  "DIRECTOR",
  "CO-ORDINATOR",
  "MANAGER",
  "OFFICE",
  " MR ",
  "MD ",
];

export function detectFloor(room: string, subLocation: string): string {
  const upper = room.toUpperCase();
  for (const [pattern, floor] of ROOM_FLOOR_PATTERNS) {
    if (pattern.test(upper)) return floor;
  }
  if (FLOOR_ORDER.includes(subLocation)) return subLocation;
  return "Other";
}

export function detectRoomType(room: string): string {
  const upper = ` ${room.toUpperCase()} `;
  if (upper.includes("CORRIDOR")) return "Corridor";
  if (upper.includes("REST ROOM")) return "Restroom";
  if (upper.includes("LAB")) return "Laboratory";
  if (upper.includes("LIBRARY")) return "Library";
  if (upper.includes("SPORTS")) return "Sports Room";
  if (upper.includes("STORE")) return "Store Room";
  if (upper.includes("STAFF ROOM")) return "Staff Room";
  if (upper.includes("XEROX")) return "Utility";
  if (upper.includes("LANGUAGE ROOM") || upper.includes("NO SECTION BOARD"))
    return "Classroom";
  if (ADMIN_WORDS.some((word) => upper.includes(word))) return "Office";
  if (upper.includes("HALL")) return "Hall";
  if (upper.includes("STAGE")) return "Stage";
  if (upper.includes("AROUND")) return "Outdoor";
  if (
    upper.includes("DANCE") ||
    upper.includes("MUSIC") ||
    upper.includes("ART")
  )
    return "Activity Room";
  if (upper.includes("A V ROOM") || upper.includes("AV ROOM")) return "AV Room";
  if (upper.includes("COMPUTER")) return "Laboratory";
  if (upper.includes("NURSERY") || CLASSROOM.test(upper)) return "Classroom";
  return "Other";
}

export type RawAssetRow = {
  id?: string | null;
  itemName?: unknown;
  quantity?: unknown;
  serialNo?: string | null;
  modelNo?: string | null;
  location?: string | null;
  subLocation?: string | null;
  room?: string | null;
};

/**
 * Turns a raw spreadsheet row into an inventory record. Applied to both the
 * local snapshot and live Google Sheets data so both look identical downstream.
 */
export function normaliseAsset(row: RawAssetRow, index: number): Asset {
  const room = clean(row.room) ?? "Unassigned";
  const subLocation = normaliseSubLocation(row.subLocation ?? null);
  const quantity =
    typeof row.quantity === "number"
      ? row.quantity
      : Number.parseInt(String(row.quantity ?? "0").replace(/[^\d-]/g, ""), 10) ||
        0;

  const locationRaw = clean(row.location) ?? "Devakul";

  return {
    id: clean(row.id) ?? `A-${String(index + 1).padStart(4, "0")}`,
    itemName: clean(row.itemName) ?? "Unnamed item",
    quantity: Number.isFinite(quantity) ? quantity : 0,
    serialNo: clean(row.serialNo),
    modelNo: clean(row.modelNo),
    location: locationRaw.toUpperCase() === "DEVAKUL" ? "Devakul" : locationRaw,
    subLocation,
    room,
    floor: detectFloor(room, subLocation),
    roomType: detectRoomType(room),
  };
}
