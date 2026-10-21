import type { Metadata } from "next";

import { LoginForm } from "@/components/login-form";
import { CheckIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 px-8 py-10 text-white sm:px-12 lg:flex lg:px-14 lg:py-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(223,167,52,0.22),transparent_58%)]"
        />
        <div
          aria-hidden
          className="absolute -right-24 top-1/3 h-72 w-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden
          className="absolute -right-10 top-1/3 h-48 w-48 rounded-full border border-white/10"
        />

        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 font-display text-xl text-ink-950">
            G
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg">Gitanjali Schools</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">
              Asset Register
            </span>
          </span>
        </div>

        <div className="relative max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300">
            Devakul campus · 2026–27
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">
            Every chair, projector and lab kit — accounted for.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-200">
            A single source of truth for the school&apos;s physical assets, broken
            down by floor, room and item so nothing slips between the cracks.
          </p>

          <ul className="mt-9 space-y-2.5">
            {[
              "Floor, room and item-level breakdown",
              "Serial and model numbers on record",
              "Filter, chart and export any view",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-400/15 text-gold-300">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13px] text-ink-100">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-[11px] text-ink-400">
          <ShieldIcon className="h-3.5 w-3.5 text-gold-400" />
          Internal register · authorised staff only
        </p>
      </section>

      <section className="flex items-center justify-center bg-ink-50 px-5 py-10 sm:px-8 lg:py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 font-display text-lg text-ink-950">
              G
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg text-ink-950">
                Gitanjali Schools
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                Asset Register
              </span>
            </span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600">
            Welcome back
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink-950">Sign in</h2>
          <p className="mt-2 text-sm text-ink-500">
            Use the school administrator account to open the asset register.
          </p>

          <div className="mt-8">
            <LoginForm next={next ?? "/"} />
          </div>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-ink-400">
            Access is logged. Contact the IT office if you need a different
            account.
          </p>
        </div>
      </section>
    </div>
  );
}
