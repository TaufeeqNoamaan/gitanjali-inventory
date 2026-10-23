import Link from "next/link";

import { signOut } from "@/app/login/actions";
import { BrandLogo, BrandMark } from "@/components/brand-logo";
import { LogOutIcon } from "@/components/icons";
import type { NavCounts } from "@/components/shell/nav";
import { SidebarNav } from "@/components/shell/nav";
import { ADMIN_EMAIL } from "@/lib/auth";

export function Sidebar({ counts }: { counts: NavCounts }) {
  return (
    <aside
      className="no-print group fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col overflow-hidden border-r border-white/5 bg-ink-950 transition-[width] duration-300 ease-out hover:w-[272px] focus-within:w-[272px] lg:flex"
      aria-label="Primary"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(223,167,52,0.16),transparent_62%)]"
      />

      <div className="relative flex items-center px-[18px] pb-6 pt-6 group-hover:px-5">
        <Link
          href="/"
          aria-label="Gitanjali Schools home"
          className="flex items-center"
        >
          <BrandMark className="h-10 w-10 rounded-xl group-hover:hidden group-focus-within:hidden" />
          <span className="hidden items-center rounded-lg bg-white px-3 py-1.5 group-hover:flex group-focus-within:flex">
            <BrandLogo className="h-6" priority />
          </span>
        </Link>
      </div>

      <div className="nice-scroll relative flex-1 overflow-y-auto overflow-x-hidden px-3">
        <p className="px-[26px] pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500 opacity-0 transition-opacity group-hover:px-3 group-hover:opacity-100 group-focus-within:opacity-100">
          Inventory
        </p>
        <SidebarNav counts={counts} />
      </div>

      <div className="relative border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-xs font-bold text-ink-950">
            AD
          </span>
          <span className="min-w-0 flex-1 whitespace-nowrap leading-tight opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="block truncate text-xs font-semibold text-white">
              School Admin
            </span>
            <span className="block truncate text-[10px] text-ink-400">
              {ADMIN_EMAIL}
            </span>
          </span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            title="Sign out"
            className="mt-1 flex w-full items-center gap-2 rounded-xl py-2 pl-[17px] pr-2 text-xs font-semibold text-ink-300 transition hover:bg-white/5 hover:text-white group-hover:pl-3"
          >
            <LogOutIcon className="h-[18px] w-[18px] shrink-0" />
            <span className="whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              Sign out
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}
