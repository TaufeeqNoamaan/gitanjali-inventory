import Link from "next/link";

import { signOut } from "@/app/login/actions";
import { BuildingIcon, LogOutIcon } from "@/components/icons";
import { MobileNav } from "@/components/shell/nav";
import { DataSourcePill } from "@/components/ui/primitives";
import { dataSource } from "@/lib/data";
import { ADMIN_EMAIL } from "@/lib/auth";

export function Topbar() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 font-display text-base text-ink-950">
                G
              </span>
            </Link>
            <div className="hidden items-center gap-2 text-xs text-ink-500 lg:flex">
              <BuildingIcon className="h-4 w-4 text-ink-400" />
              <span className="font-medium text-ink-700">Devakul campus</span>
              <span className="text-ink-300">/</span>
              <span>Academic year 2026–27</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DataSourcePill live={dataSource === "google-sheets"} />
            <div className="hidden items-center gap-2.5 border-l border-ink-100 pl-3 sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                AD
              </span>
              <span className="leading-tight">
                <span className="block text-xs font-semibold text-ink-800">
                  School Admin
                </span>
                <span className="block text-[10px] text-ink-400">
                  {ADMIN_EMAIL}
                </span>
              </span>
            </div>
            <form action={signOut} className="lg:hidden">
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="grid h-9 w-9 place-items-center rounded-xl border border-ink-200 bg-white text-ink-500 transition hover:border-ink-300 hover:text-ink-900"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="relative lg:hidden">
          <MobileNav />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -right-4 w-10 bg-gradient-to-l from-white to-transparent"
          />
        </div>
      </div>
    </header>
  );
}
