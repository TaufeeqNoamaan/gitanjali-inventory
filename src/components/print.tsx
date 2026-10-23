import { BrandLogo } from "@/components/brand-logo";

/**
 * Letterhead shown only on paper. The on-screen page header is hidden in print,
 * so this carries the school identity, the document title and any filters that
 * produced the list.
 */
export function PrintHeader({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
}) {
  return (
    <div className="mb-5 hidden border-b border-ink-900/20 pb-4 print:block">
      <div className="flex items-start justify-between gap-6">
        <BrandLogo className="h-9" />
        <div className="text-right text-[10px] leading-relaxed text-ink-600">
          <p className="font-semibold uppercase tracking-[0.14em] text-ink-900">
            Asset Register
          </p>
          <p>Devakul campus · Academic year 2026–27</p>
        </div>
      </div>

      <div className="mt-4">
        <h1 className="font-display text-2xl text-ink-950">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-[11px] text-ink-700">{subtitle}</p>
        ) : null}
        {meta ? (
          <p className="mt-0.5 text-[10px] text-ink-500">{meta}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Signature block for physical verification / hand-over sheets. */
export function PrintSignature({ label = "Verified by" }: { label?: string }) {
  return (
    <div className="mt-10 hidden items-end justify-between gap-10 text-[11px] text-ink-700 print:flex">
      <span>{label}: ______________________________</span>
      <span>Date: ____________________</span>
    </div>
  );
}
