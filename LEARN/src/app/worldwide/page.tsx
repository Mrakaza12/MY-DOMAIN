import type { Metadata } from "next";

import { InfoShell } from "@/components/InfoPage";
import { LanguagePicker } from "@/components/LanguagePicker";
import { countries } from "@/lib/countries";
import { getLocaleContext } from "@/lib/server-locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ppip — Worldwide",
};

export default async function WorldwidePage() {
  const { locale } = await getLocaleContext();

  return (
    <InfoShell
      eyebrow="Global"
      title="Ppip worldwide"
      intro="Create an account in any of the countries below. Your country sets the currency used for your demo balance and payments."
    >
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-[#fbfbfa] px-4 py-3.5">
        <div>
          <p className="text-[14px] font-semibold text-ink">Language</p>
          <p className="text-[13px] text-muted">
            The sign-in screen supports six languages. Pick one here to preview it.
          </p>
        </div>
        <LanguagePicker locale={locale} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {countries.map((country) => (
          <div
            key={country.code}
            className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span aria-hidden className="text-[22px] leading-none">
                {country.flag}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-semibold text-ink">
                  {country.name}
                </span>
                <span className="block text-[12.5px] text-muted">
                  {country.currency} · {country.dial}
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-[#e7f6ec] px-2.5 py-1 text-[11.5px] font-semibold text-[#1b7a3d]">
              Available
            </span>
          </div>
        ))}
      </div>

      <p className="rounded-lg bg-[#fbfbfa] px-4 py-3 text-[13.5px] leading-relaxed text-muted">
        Don&apos;t see your country? You can still choose United Kingdom when signing up — the demo
        will simply use GBP for your balance.
      </p>
    </InfoShell>
  );
}
