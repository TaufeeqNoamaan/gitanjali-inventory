import type { Metadata } from "next";

import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/login-form";

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
      <section className="relative hidden flex-col overflow-hidden bg-ink-950 px-8 py-10 text-white sm:px-12 lg:flex lg:px-14 lg:py-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(223,167,52,0.22),transparent_58%)]"
        />
        <div
          aria-hidden
          className="absolute -right-24 bottom-10 h-80 w-80 rounded-full border border-white/[0.07]"
        />

        <div className="relative">
          <span className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-lg shadow-ink-950/20">
            <BrandLogo className="h-9" priority />
          </span>
        </div>

        <div className="relative my-auto max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300">
            Devakul campus · 2026–27
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-6xl">
            Asset register
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-300">
            A single source of truth for the school&apos;s physical assets, broken
            down by floor.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-ink-50 px-5 py-10 sm:px-8 lg:py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandLogo className="h-8" />
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
