export type Asset = {
  id: string;
  itemName: string;
  quantity: number;
  serialNo: string | null;
  modelNo: string | null;
  location: string;
  subLocation: string;
  room: string;
  floor: string;
  roomType: string;
};

export type FloorBreakdown = {
  label: string;
  units: number;
  records: number;
  share: number;
};

export type RoomTypeBreakdown = {
  label: string;
  units: number;
  records: number;
  rooms: number;
  share: number;
};

export type RoomSummary = {
  room: string;
  slug: string;
  floor: string;
  roomType: string;
  units: number;
  records: number;
  itemTypes: number;
  serialised: number;
  topItems: { name: string; units: number }[];
};

export type ItemSummary = {
  name: string;
  slug: string;
  units: number;
  records: number;
  rooms: number;
  floors: string[];
};

export type RegisterHealth = {
  totalRecords: number;
  serialised: number;
  missingSerial: number;
  qrPending: number;
  flagged: number;
};

export type InventoryStats = {
  totalUnits: number;
  totalRecords: number;
  roomCount: number;
  itemCount: number;
  floorCount: number;
  avgUnitsPerRoom: number;
  largestRoom: { name: string; slug: string; units: number } | null;
  byFloor: FloorBreakdown[];
  byRoomType: RoomTypeBreakdown[];
  health: RegisterHealth;
};
