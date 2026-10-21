import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 px-5">
      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 font-display text-xl text-ink-950">
          G
        </span>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600">
          404 · Not found
        </p>
        <h1 className="mt-2 font-display text-2xl text-ink-950">
          That record isn&apos;t in the register
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          The room, item or page you were looking for may have been renamed or
          was never recorded.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary">
            Back to dashboard
          </Link>
          <Link href="/assets" className="btn-ghost">
            Search the register
          </Link>
        </div>
      </div>
    </div>
  );
}
