import Link from "next/link";
import type { InputHTMLAttributes, ReactNode } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Ppip"
      role="img"
      className={`brand-logo inline-block leading-none select-none ${className}`}
    >
      Ppip
    </span>
  );
}

export function AuthCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`w-full max-w-[700px] rounded-2xl border border-line bg-white px-6 py-10 shadow-[0_1px_4px_rgba(0,0,0,0.05)] sm:px-[60px] sm:py-[52px] ${className}`}
    >
      {children}
    </section>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-10 pb-8 sm:px-6 sm:pt-14">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

const footerLinks = [
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy" },
  { href: "/legal", label: "Legal" },
  { href: "/worldwide", label: "Worldwide" },
];

export function SiteFooter() {
  return (
    <footer className="px-4 pb-10 pt-2 sm:pb-12">
      <nav
        aria-label="Footer"
        className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3"
      >
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[16px] font-medium text-[#4d5155] transition-colors hover:text-brand hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="mt-5 text-center text-[12.5px] text-[#8a8d90]">
        Ppip is a demo product. No real money moves.
      </p>
    </footer>
  );
}

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  trailing?: ReactNode;
};

export function AuthInput({ invalid, trailing, className = "", ...props }: AuthInputProps) {
  return (
    <div className="relative">
      <input
        {...props}
        aria-invalid={invalid || undefined}
        className={`h-[58px] w-full rounded-lg border bg-white px-4 text-[17px] text-ink transition placeholder:text-[#6c6c6c] focus:outline-none focus:ring-1 ${
          invalid
            ? "border-[#c0392b] focus:border-[#c0392b] focus:ring-[#c0392b]"
            : "border-[#c4c6c8] focus:border-brand focus:ring-brand"
        } ${trailing ? "pr-16" : ""} ${className}`}
      />
      {trailing ? (
        <div className="absolute inset-y-0 right-1 flex items-center pr-2">{trailing}</div>
      ) : null}
    </div>
  );
}

export function PrimaryButton({
  children,
  pending,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean }) {
  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={`flex h-[58px] w-full items-center justify-center gap-3 rounded-full bg-brand px-6 text-[19px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {pending ? <span className="ppip-spinner" aria-hidden /> : null}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-[58px] w-full items-center justify-center rounded-full border-[1.5px] border-black bg-white px-6 text-[19px] font-semibold text-black transition-colors hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex h-[58px] w-full items-center justify-center rounded-full border-[1.5px] border-black bg-white px-6 text-[19px] font-semibold text-black transition-colors hover:bg-[#f4f4f4] ${className}`}
    >
      {children}
    </Link>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      aria-live="polite"
      className="ppip-fade-up mt-2 flex items-start gap-2 text-[15px] font-medium leading-snug text-[#b3261e]"
    >
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="mt-[2px] h-4 w-4 shrink-0 fill-current"
      >
        <path d="M10 1.7 1.7 16.3h16.6L10 1.7Zm0 4.8c.6 0 1 .5 1 1.1v3.6a1 1 0 0 1-2 0V7.6c0-.6.4-1.1 1-1.1Zm0 8.9a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-[#dcdcdc]" />
      <span className="text-[16px] text-[#5f6368]">{label}</span>
      <span className="h-px flex-1 bg-[#dcdcdc]" />
    </div>
  );
}
