import Link from "next/link";
import type { ReactNode } from "react";

import { Logo, SiteFooter } from "@/components/ui";

export function InfoShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Ppip home">
            <Logo className="text-[30px]" />
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#cfd1d3] bg-white px-5 py-2 text-[14px] font-semibold text-body transition hover:border-ink hover:text-ink"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <article className="rounded-2xl border border-line bg-white px-5 py-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:px-10 sm:py-10">
          {eyebrow ? (
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-brand">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-[clamp(1.7rem,4vw,2.4rem)] font-semibold leading-tight text-ink">
            {title}
          </h1>
          {intro ? (
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-body">{intro}</p>
          ) : null}
          <div className="mt-7 space-y-6 text-[15px] leading-relaxed text-body">{children}</div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-2.5">{children}</div>
    </section>
  );
}
