import Link from "next/link";
import type { ReactNode } from "react";

import { SITE_NAME } from "@/lib/site";

/** Small geometric mark — a rounded tile holding a keyhole. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-[13px] bg-brand text-white shadow-[0_6px_16px_-6px_rgba(15,118,110,0.75)]"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none">
        <circle cx="12" cy="9.5" r="3.2" stroke="currentColor" strokeWidth="1.9" />
        <path
          d="M12 12.6v4.6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[22px] font-semibold tracking-[-0.01em] text-ink ${className}`}>
      {SITE_NAME}
    </span>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 pt-8 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <Logo />
          <Wordmark />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-6 sm:py-14">
        {children}
      </main>

      <footer className="px-6 pb-8 text-center text-[13px] leading-relaxed text-muted">
        <p>
          {SITE_NAME} is a demo app. Accounts are stored in this browser only — nothing
          is sent to a server, and passwords are hashed before they are saved.
        </p>
        <p className="mt-1">
          <a
            className="font-medium text-brand hover:underline"
            href="https://github.com/Mrakaza12/MY-DOMAIN"
            rel="noreferrer noopener"
            target="_blank"
          >
            Source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[14px] font-medium text-body">
          {label}
        </label>
        {hint ? <span className="text-[12.5px] text-muted">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function TextInput({
  invalid,
  trailing,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <div className="relative">
      <input
        {...props}
        aria-invalid={invalid || undefined}
        className={`h-[50px] w-full rounded-xl border bg-white px-3.5 text-[16px] text-ink outline-none transition placeholder:text-[#98a1aa] focus:ring-2 ${
          invalid
            ? "border-[#c2413a] focus:border-[#c2413a] focus:ring-[#f4d6d3]"
            : "border-line focus:border-brand focus:ring-[#cfe7e2]"
        } ${trailing ? "pr-16" : ""} ${className}`}
      />
      {trailing ? (
        <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
}: {
  children: ReactNode;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand px-6 text-[16px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-75"
    >
      {pending ? <span className="spinner" aria-hidden /> : null}
      <span>{children}</span>
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rise-in mt-3 flex items-start gap-2 text-[13.5px] font-medium leading-snug text-[#b3261e]"
    >
      <svg aria-hidden viewBox="0 0 20 20" className="mt-[2px] h-4 w-4 shrink-0 fill-current">
        <path d="M10 1.7 1.7 16.3h16.6L10 1.7Zm0 4.8c.6 0 1 .5 1 1.1v3.6a1 1 0 0 1-2 0V7.6c0-.6.4-1.1 1-1.1Zm0 8.9a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
