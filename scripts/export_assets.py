"""
Converts the Gitanjali Schools asset workbook into the JSON dataset consumed by
the web app (src/data/assets.json).

Usage:
    python scripts/export_assets.py "Devakul Assets 2026-2027.xlsx"

The app reads this file only when no live spreadsheet is configured. Once the data
moves to the shared spreadsheet, set GOOGLE_SHEET_ID (see .env.example) and this script
becomes an offline snapshot tool.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_XLSX = ROOT / "Devakul Assets 2026-2027.xlsx"
OUTPUT = ROOT / "src" / "data" / "assets.json"


def clean(value) -> str | None:
    if value is None:
        return None
    text = " ".join(str(value).replace("\r", " ").split())
    return text or None


def normalise_location(value: str | None) -> str:
    text = (value or "Devakul").strip()
    return text.title() if text.upper() == "DEVAKUL" else text


FLOOR_BY_SUBLOCATION = {
    "DEVAKUL - CELLAR": "Cellar",
    "CELLAR": "Cellar",
    "GROUND FLOOR": "Ground Floor",
    "DEVAKUL - GF FLOOR": "Ground Floor",
    "1ST FLOOR": "1st Floor",
    "2ND FLOOR": "2nd Floor",
    "3RD FLOOR": "3rd Floor",
    "4TH FLOOR": "4th Floor",
    "DEVAKUL - 4TH FLOOR": "4th Floor",
    "DEVAKUL - MP HALL": "MP Hall",
}


def normalise_sublocation(value: str | None) -> str:
    text = (value or "").strip()
    key = " ".join(text.upper().split())
    return FLOOR_BY_SUBLOCATION.get(key, text.title() if text.isupper() else text)


ROOM_FLOOR_PREFIXES = (
    (re.compile(r"^(CF|CELLER|CELLAR)\b"), "Cellar"),
    (re.compile(r"^GF\b"), "Ground Floor"),
    (re.compile(r"^1F\b"), "1st Floor"),
    (re.compile(r"^2F\b"), "2nd Floor"),
    (re.compile(r"^3F\b"), "3rd Floor"),
    (re.compile(r"^(4F|4TH)\b"), "4th Floor"),
)

CLASSROOM = re.compile(r"(^|\s)(PP\s?\d?|NURSERY|\d{1,2})\s*-\s*[A-C]\b")
ADMIN_WORDS = (
    "PRINCIPAL",
    "FOUNDER",
    "DIRECTOR",
    "CO-ORDINATOR",
    "MANAGER",
    "OFFICE",
    " MR ",
    "MD ",
)


def detect_floor(room: str, sub_location: str) -> str:
    upper = room.upper()
    for pattern, floor in ROOM_FLOOR_PREFIXES:
        if pattern.search(upper):
            return floor
    if sub_location in FLOOR_BY_SUBLOCATION.values():
        return sub_location
    return "Other"


def detect_room_type(room: str) -> str:
    upper = f" {room.upper()} "
    if "CORRIDOR" in upper:
        return "Corridor"
    if "REST ROOM" in upper:
        return "Restroom"
    if "LAB" in upper:
        return "Laboratory"
    if "LIBRARY" in upper:
        return "Library"
    if "SPORTS" in upper:
        return "Sports Room"
    if "STORE" in upper:
        return "Store Room"
    if "STAFF ROOM" in upper:
        return "Staff Room"
    if "XEROX" in upper:
        return "Utility"
    if "LANGUAGE ROOM" in upper or "NO SECTION BOARD" in upper:
        return "Classroom"
    if any(word in upper for word in ADMIN_WORDS):
        return "Office"
    if "HALL" in upper:
        return "Hall"
    if "STAGE" in upper:
        return "Stage"
    if "AROUND" in upper:
        return "Outdoor"
    if "DANCE" in upper or "MUSIC" in upper or "ART" in upper:
        return "Activity Room"
    if "A V ROOM" in upper or "AV ROOM" in upper:
        return "AV Room"
    if "COMPUTER" in upper:
        return "Laboratory"
    if "NURSERY" in upper or CLASSROOM.search(upper):
        return "Classroom"
    return "Other"


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    workbook = openpyxl.load_workbook(source, data_only=True)
    sheet = workbook.worksheets[0]
    rows = list(sheet.iter_rows(values_only=True))
    header = [str(cell).strip().upper() if cell else "" for cell in rows[0]]

    def column(name: str) -> int:
        return header.index(name)

    idx_item = column("ITEM NAME")
    idx_qty = column("QTY")
    idx_serial = column("SERIAL NO")
    idx_model = column("MODEL NO")
    idx_location = column("LOCATION")
    idx_sub = column("SUB LOCATION")
    idx_room = column("PRESENT ALLOTED ROOM")

    assets = []
    for number, row in enumerate(rows[1:], start=1):
        if row[idx_item] is None:
            continue
        room = clean(row[idx_room]) or "Unassigned"
        sub_location = normalise_sublocation(clean(row[idx_sub]))
        quantity = row[idx_qty]
        assets.append(
            {
                "id": f"A-{number:04d}",
                "itemName": clean(row[idx_item]),
                "quantity": int(quantity) if isinstance(quantity, (int, float)) else 0,
                "serialNo": clean(row[idx_serial]),
                "modelNo": clean(row[idx_model]),
                "location": normalise_location(clean(row[idx_location])),
                "subLocation": sub_location,
                "room": room,
                "floor": detect_floor(room, sub_location),
                "roomType": detect_room_type(room),
            }
        )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(assets, indent=0, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    total_qty = sum(asset["quantity"] for asset in assets)
    print(f"Wrote {len(assets)} line items ({total_qty} units) -> {OUTPUT}")


if __name__ == "__main__":
    main()
