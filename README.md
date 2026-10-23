# Gitanjali Schools — Asset Register

A granular inventory portal for the **Gitanjali Schools, Devakul campus**. It turns
the school's asset spreadsheet — currently `Devakul Assets 2026-2027.xlsx` — into a
browsable register: every floor, every room, every item, down to individual serial
numbers.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** and no
runtime database. Data comes from the bundled Excel snapshot today and from a live
spreadsheet tomorrow, with a single environment variable switch.

---

## Getting started

Requires **Node.js 18.18+** (tested on 18.20.8).

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and sign in with the school admin account:

| Field    | Value                        |
| -------- | ---------------------------- |
| Email    | `admin@gitanjalischools.com` |
| Password | `admin123`                   |

Both values live in `src/lib/auth.ts` and can be overridden with the `ADMIN_EMAIL`
and `ADMIN_PASSWORD` environment variables.

---

## What's inside

| Route            | Purpose                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `/login`         | Split-screen sign-in. Signed, HTTP-only session cookie.                                            |
| `/`              | Dashboard — totals, assets by floor, asset mix by room type, busiest rooms, register health.        |
| `/analytics`     | Charts — bar (units by floor, record-size distribution), pie (room-type share), line (concentration). |
| `/assets`        | Full register: search, five-way filtering, sorting, pagination, CSV export, and a detail drawer.   |
| `/rooms`         | Every room grouped by floor, with unit counts and top items.                                       |
| `/rooms/[slug]`  | Room profile — full item table, serial coverage, room facts, neighbouring rooms.                   |
| `/items`         | Item catalogue across all 237 asset types.                                                         |
| `/items/[slug]`  | Item profile — floor spread, room-by-room quantities, recorded serial numbers.                     |

### Granular details surfaced per asset

- Quantity, serial number, model number, record ID
- Location → sub-location → floor → room → room type
- Register health flags: missing serial, QR sticker pending, spare/inactive equipment
- "Other items in this room" cross-links from the asset drawer

---

## Data pipeline

```
Devakul Assets 2026-2027.xlsx
        │  python scripts/export_assets.py
        ▼
src/data/assets.json  ──►  src/lib/data.ts  ──►  pages & components
                                   ▲
                     Spreadsheet │ (optional, live)
```

### Regenerating the snapshot from Excel

```bash
python scripts/export_assets.py "Devakul Assets 2026-2027.xlsx"
```

The script normalises the sheet — trims whitespace, fixes `DEVAKUL`/`Devakul`
casing, derives the **floor** from the room code (`CF-*` → Cellar, `GF-*` → Ground
Floor, …) and classifies each **room type** (Classroom, Laboratory, Store Room,
Corridor, Office, Hall, …).

### Switching to a live spreadsheet

This repo is already pointed at the staff-maintained sheet through `.env.local`
(git-ignored):

```env
GOOGLE_SHEET_ID=1Goz9kLkPgmEhyTvaclDPx8OaNzAYWBkcwpsmvyp12P4
GOOGLE_SHEET_NAME=Sheet1
SHEET_REVALIDATE_SECONDS=60
```

To point at a different sheet:

1. Share the sheet as *Anyone with the link → Viewer*.
2. Copy `.env.example` to `.env.local` and set:

```env
GOOGLE_SHEET_ID=1AbC...your-sheet-id
GOOGLE_SHEET_NAME=Sheet1
```

When `GOOGLE_SHEET_ID` is set, `src/lib/data.ts` fetches the tab as CSV from the
spreadsheet endpoint every `SHEET_REVALIDATE_SECONDS` (default 300s), applies the
same normalisation, and falls back to the bundled snapshot if the sheet is
unreachable. Header names are matched flexibly (`QTY`/`QUANTITY`,
`PRESENT ALLOTED ROOM`/`ROOM`, …), so small column renames won't break the app.

---

## Scripts

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run data:import  # regenerate src/data/assets.json from the Excel file
```

> **Stop `npm run dev` before running `npm run build`.** Both commands write to the
> same `.next` directory; running them together leaves a half-written build that
> serves `500`s (`ENOENT ... app-paths-manifest.json`). If that happens, stop the
> dev server, delete `.next`, and start again.

---

## Deploying to Firebase App Hosting

Two config files are checked in:

| File                     | Purpose                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `apphosting.yaml`        | Read by App Hosting on every rollout — this is the file that actually applies.                           |
| `cloudhosting.prod.yaml` | Production copy in the team's `cloudhosting.<env>.yaml` naming. Keep it in sync with `apphosting.yaml`. |

> App Hosting only recognises `apphosting.yaml` and `apphosting.<env>.yaml`. If you
> edit `cloudhosting.prod.yaml`, copy the change into `apphosting.yaml` (or rename
> the file) before pushing, otherwise the deploy silently uses the old values.

What the config does:

- `runConfig` — 1 CPU, 1 GiB, 0–10 instances, concurrency 80.
- `env` — spreadsheet id/name, refresh interval, admin credentials, `AUTH_SECRET`
  and a telemetry opt-out. All are available at both `BUILD` and `RUNTIME` unless
  noted otherwise.
- `AUTH_SECRET` **must** be available at build *and* runtime: Next.js inlines env
  values into the edge-runtime middleware at build time, while the sign-in server
  action reads them per request. If the two differ, every login is rejected.

Creating the backend (console is fine too — *Hosting & Serverless → App Hosting →
Create backend*, app root `/`, Node.js 20 runtime):

```bash
npm install -g firebase-tools
firebase login
firebase apphosting:backends:create --project <your-project-id>
```

Before staff start using it:

1. Change `ADMIN_PASSWORD` and set your own `AUTH_SECRET` in **both** YAML files.
2. Keep the spreadsheet shared as *Anyone with the link → Viewer*, or the app
   falls back to the bundled Excel snapshot.
3. When the repository becomes public, move the password and secret out of the
   YAML and into Cloud Secret Manager (`secret: <name>@latest`).

---

## Project structure

```
apphosting.yaml           # Firebase App Hosting config (read on deploy)
cloudhosting.prod.yaml    # production twin of the above
src/
├─ app/
│  ├─ (dashboard)/        # authenticated shell: sidebar + topbar
│  │  ├─ page.tsx         # dashboard
│  │  ├─ analytics/       # chart page
│  │  ├─ assets/page.tsx  # register
│  │  ├─ rooms/           # rooms grid + room profile
│  │  └─ items/           # catalogue + item profile
│  ├─ login/              # sign-in page + server actions
│  ├─ layout.tsx          # fonts, metadata, global CSS
│  └─ not-found.tsx
├─ components/
│  ├─ assets/             # explorer table + detail drawer
│  ├─ charts/             # SVG bar, pie and line charts
│  ├─ rooms/              # room grid
│  ├─ items/              # item catalogue
│  ├─ shell/              # sidebar, topbar, nav
│  └─ ui/                 # stat cards, bar list, donut, pills
├─ lib/
│  ├─ auth.ts             # session token signing/verification (Web Crypto)
│  ├─ data.ts             # live spreadsheet / snapshot loading + aggregations
│  ├─ normalize.ts        # row normalisation, floor & room-type derivation
│  ├─ types.ts
│  └─ utils.ts
├─ data/assets.json       # generated snapshot (1,332 rows · 5,026 units)
└─ middleware.ts          # protects every route except /login
```

---

## Notes

- Session cookies are signed with HMAC-SHA256 and expire after 12 hours. Set
  `AUTH_SECRET` in production.
- `/assets` supports deep links used by the dashboard health card:
  `?flag=missing-serial`, `?flag=qr-pending`, `?flag=flagged`, plus `q`, `floor`,
  `room`, `item`, `roomType`.
- Charts are hand-built SVG (`src/components/charts/`) — bar, pie and line — so
  they render on the server, scale with their container, and add no chart-library
  weight to the bundle. Hover any bar, slice or point for a native tooltip.
- Mobile-first layout: below `md` the register switches from a table to a tappable
  card list, below `sm` the bar charts render as horizontal bars and the line chart
  drops its axis labels, and the sign-in page hides its marketing panel on phones.
  Inputs are 16px on small screens so iOS doesn't zoom on focus.
- Print: the register, room sheet, item sheet, rooms overview, item catalogue and
  analytics each have a **Print** action with an A4 stylesheet — letterhead, the
  active filters, full tables (the register prints every filtered row, not just the
  visible page) and a signature line on the physical-verification sheets.
- Served entirely from React Server Components; only the register, room grid and
  catalogue ship client JavaScript.
