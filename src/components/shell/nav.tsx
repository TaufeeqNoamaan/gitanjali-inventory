"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardIcon, ChartIcon, DoorIcon, LayersIcon, TagIcon } from "@/components/icons";
import { cn, formatNumber } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/assets", label: "Assets", icon: LayersIcon, countKey: "records" },
  { href: "/rooms", label: "Rooms", icon: DoorIcon, countKey: "rooms" },
  { href: "/items", label: "Item catalogue", icon: TagIcon, countKey: "items" },
] as const;

export type NavCounts = {
  records: number;
  rooms: number;
  items: number;
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SidebarNav({ counts }: { counts: NavCounts }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        const count =
          "countKey" in item ? counts[item.countKey as keyof NavCounts] : null;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/10 text-white"
                  : "text-ink-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-gold-400 transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  active ? "text-gold-300" : "text-ink-400 group-hover:text-ink-200",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {count !== null ? (
                <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-ink-400">
                  {formatNumber(count)}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-3 lg:hidden">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              active
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
