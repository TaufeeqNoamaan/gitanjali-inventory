import { signOut } from "@/app/login/actions";
import { LogOutIcon, ShieldIcon } from "@/components/icons";
import { Logo } from "@/components/ui/primitives";
import { ADMIN_EMAIL } from "@/lib/auth";
import { dataSourceLabel, dataSource } from "@/lib/data";
import type { NavCounts } from "@/components/shell/nav";
import { SidebarNav } from "@/components/shell/nav";

export function Sidebar({ counts }: { counts: NavCounts }) {
  return (
    <aside className="no-print relative hidden overflow-hidden bg-ink-950 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(223,167,52,0.16),transparent_62%)]"
      />

      <div className="relative px-5 pb-6 pt-6">
        <Logo />
      </div>

      <div className="relative flex-1 overflow-y-auto px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500">
          Inventory
        </p>
        <SidebarNav counts={counts} />

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-300">
            <ShieldIcon className="h-3.5 w-3.5" />
            Data source
          </p>
          <p className="mt-1.5 text-xs font-medium text-ink-100">
            {dataSourceLabel}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
            {dataSource === "google-sheets"
              ? "Rows refresh automatically from the shared spreadsheet."
              : "Bundled Excel snapshot. Point the app at Google Sheets when the live sheet is ready."}
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-xs font-bold text-ink-950">
            AD
          </span>
          <span className="min-w-0 flex-1 leading-tight">
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
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-ink-300 transition hover:bg-white/5 hover:text-white"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
