"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { locales, type LocaleCode } from "@/lib/i18n";

export function LanguagePicker({ locale }: { locale: LocaleCode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<LocaleCode>(locale);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const active = locales.find((item) => item.code === current) ?? locales[0];

  function choose(code: LocaleCode) {
    setCurrent(code);
    document.cookie = `ppip_locale=${code}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${active.label}. Change language`}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[20px] leading-none transition hover:bg-[#f1f1f1] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span aria-hidden>{active.flag}</span>
        <svg
          aria-hidden
          viewBox="0 0 12 8"
          className={`h-2 w-3 fill-none stroke-[#6b7075] stroke-[1.6] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M1 1.5 6 6.5l5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <ul
            role="listbox"
            aria-label="Select a language"
            className="absolute bottom-full z-20 mb-3 w-60 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_12px_36px_rgba(0,0,0,0.16)]"
          >
            {locales.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.code === current}
                  onClick={() => choose(item.code)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[15px] text-body transition hover:bg-[#f0f6fb]"
                >
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden>{item.flag}</span>
                    {item.label}
                  </span>
                  {item.code === current ? (
                    <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-brand">
                      <path d="M6.2 12.2 2 8l1.4-1.4 2.8 2.8 6.4-6.4L14 4.4l-7.8 7.8Z" />
                    </svg>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
