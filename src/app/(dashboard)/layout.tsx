import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { getAssets, summarizeAssets } from "@/lib/data";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const assets = await getAssets();
  const stats = summarizeAssets(assets);

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar
        counts={{
          records: stats.totalRecords,
          rooms: stats.roomCount,
          items: stats.itemCount,
        }}
      />

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[76px]">
        <Topbar />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-14 pt-7 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="no-print border-t border-ink-100 px-4 py-5 text-[11px] text-ink-400 sm:px-6 lg:px-8">
          Gitanjali Schools · Asset Register · Devakul campus · Data owner: School
          Administration
        </footer>
      </div>
    </div>
  );
}
