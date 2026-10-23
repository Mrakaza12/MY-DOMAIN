import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";

import {
  AddFundsButton,
  ChangePasswordForm,
  SendMoneyForm,
  SignOutButton,
} from "@/components/account/AccountTools";
import { Logo, SiteFooter } from "@/components/ui";
import { db } from "@/db";
import { authEvents, sessions, transfers, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getCountry } from "@/lib/countries";
import { formatDate, formatMoney } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ppip — Your account",
};

type ActivityItem = {
  key: string;
  title: string;
  subtitle: string;
  amountCents: number | null;
  direction: "in" | "out" | null;
  createdAt: Date;
};

const eventLabels: Record<string, string> = {
  signup: "Account created",
  welcome_balance: "Welcome balance added",
  login: "Signed in",
  logout: "Signed out",
  login_failed: "Failed sign-in attempt",
  password_reset: "Password reset",
  password_changed: "Password changed",
  email_lookup: "Email address recovered",
  top_up: "Demo funds added",
  payment_sent: "Payment sent",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [sent, received, events, sessionRows] = await Promise.all([
    db
      .select({
        id: transfers.id,
        amountCents: transfers.amountCents,
        note: transfers.note,
        createdAt: transfers.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(transfers)
      .innerJoin(users, eq(users.id, transfers.toUserId))
      .where(eq(transfers.fromUserId, user.id))
      .orderBy(desc(transfers.createdAt))
      .limit(8),
    db
      .select({
        id: transfers.id,
        amountCents: transfers.amountCents,
        note: transfers.note,
        createdAt: transfers.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(transfers)
      .innerJoin(users, eq(users.id, transfers.fromUserId))
      .where(eq(transfers.toUserId, user.id))
      .orderBy(desc(transfers.createdAt))
      .limit(8),
    db
      .select()
      .from(authEvents)
      .where(eq(authEvents.userId, user.id))
      .orderBy(desc(authEvents.createdAt))
      .limit(7),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(sessions)
      .where(eq(sessions.userId, user.id)),
  ]);

  const activity: ActivityItem[] = [
    ...sent.map((item) => ({
      key: `sent-${item.id}`,
      title: `Sent to ${`${item.firstName} ${item.lastName}`.trim()}`,
      subtitle: item.note ?? "Ppip payment",
      amountCents: item.amountCents,
      direction: "out" as const,
      createdAt: item.createdAt,
    })),
    ...received.map((item) => ({
      key: `received-${item.id}`,
      title: `Received from ${`${item.firstName} ${item.lastName}`.trim()}`,
      subtitle: item.note ?? "Ppip payment",
      amountCents: item.amountCents,
      direction: "in" as const,
      createdAt: item.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const country = getCountry(user.country);
  const passwordPreview = `${user.passwordHash.slice(0, 16)}…`;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/account" aria-label="Ppip home" className="shrink-0">
            <Logo className="text-[30px]" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-[#f1f2f3] px-3.5 py-1.5 text-[13px] font-medium text-body sm:inline-flex">
              Signed in as <span className="ml-1 font-semibold text-ink">{user.email}</span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
              Account overview
            </p>
            <h1 className="mt-1.5 text-[clamp(1.6rem,3.4vw,2.2rem)] font-semibold leading-tight text-ink">
              Hello, {fullName}
            </h1>
            <p className="mt-1 text-[15px] text-muted">
              Your email and password are stored securely in PostgreSQL.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ec] px-3.5 py-1.5 text-[13px] font-semibold text-[#1b7a3d]">
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-current">
              <path d="M10 1.6A8.4 8.4 0 1 0 18.4 10 8.41 8.41 0 0 0 10 1.6Zm4 6.3-5 5a1 1 0 0 1-1.4 0L5 10.3l1.4-1.4 1.9 1.9 4.3-4.3Z" />
            </svg>
            Verified account
          </span>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="h-1.5 w-full bg-gradient-to-r from-brand to-[#5bb8f0]" />
              <div className="p-6 sm:p-7">
                <p className="text-[14px] font-medium text-muted">Available balance</p>
                <p className="mt-1 text-[clamp(2.1rem,5vw,2.7rem)] font-semibold leading-none tracking-tight text-ink">
                  {formatMoney(user.balanceCents, user.currency)}
                </p>
                <p className="mt-2 text-[13px] text-muted">
                  {country.flag} {country.name} · {user.currency} · Demo funds only
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <AddFundsButton />
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2.5 text-[13.5px] font-semibold text-[#075a8c]">
                    {sessionRows[0]?.count ?? 1} active session
                    {(sessionRows[0]?.count ?? 1) === 1 ? "" : "s"}
                  </span>
                </div>

                <SendMoneyForm currency={user.currency} />
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-semibold text-ink">Recent payments</h2>
                <span className="text-[13px] text-muted">Latest 6</span>
              </div>

              {activity.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-[#d6d8da] bg-[#fbfbfa] px-5 py-8 text-center">
                  <p className="text-[15px] font-medium text-ink">No payments yet</p>
                  <p className="mx-auto mt-1 max-w-sm text-[13.5px] leading-relaxed text-muted">
                    Add demo funds above, then send money to another account created on this Ppip
                    site to see payments appear here.
                  </p>
                </div>
              ) : (
                <ul className="mt-3 divide-y divide-[#eeeeec]">
                  {activity.map((item) => (
                    <li key={item.key} className="flex items-center gap-3 py-3.5">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                          item.direction === "in"
                            ? "bg-[#e7f6ec] text-[#1b7a3d]"
                            : "bg-[#fdeceb] text-[#b3261e]"
                        }`}
                      >
                        <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                          {item.direction === "in" ? (
                            <path d="M10 2 3 9h4v9h6V9h4l-7-7Z" />
                          ) : (
                            <path d="M10 18l7-7h-4V2H7v9H3l7 7Z" />
                          )}
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-ink">{item.title}</p>
                        <p className="truncate text-[13px] text-muted">
                          {formatDate(item.createdAt)} · {item.subtitle}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[15px] font-semibold ${
                          item.direction === "in" ? "text-[#1b7a3d]" : "text-ink"
                        }`}
                      >
                        {item.direction === "in" ? "+" : "−"}
                        {formatMoney(item.amountCents ?? 0, user.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h2 className="text-[17px] font-semibold text-ink">Credentials stored</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                A record for this account lives in the <code className="text-[12px]">users</code>{" "}
                table. Passwords are salted and hashed with scrypt.
              </p>

              <dl className="mt-4 space-y-3 text-[14px]">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Email</dt>
                  <dd className="max-w-[60%] break-all text-right font-medium text-ink">
                    {user.email}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Mobile</dt>
                  <dd className="text-right font-medium text-ink">{user.phone ?? "Not added"}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Country</dt>
                  <dd className="text-right font-medium text-ink">
                    {country.flag} {country.name}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Password hash</dt>
                  <dd className="max-w-[60%] break-all text-right font-mono text-[12px] text-ink">
                    {passwordPreview}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Member since</dt>
                  <dd className="text-right font-medium text-ink">{formatDate(user.createdAt)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Last login</dt>
                  <dd className="text-right font-medium text-ink">{formatDate(user.lastLoginAt)}</dd>
                </div>
              </dl>

              <ChangePasswordForm />

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-[13px]">
                <Link href="/forgot-password" className="font-medium text-brand hover:underline">
                  Reset a forgotten password
                </Link>
                <Link href="/contact" className="font-medium text-brand hover:underline">
                  Contact us
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h2 className="text-[17px] font-semibold text-ink">Security activity</h2>
              {events.length === 0 ? (
                <p className="mt-3 text-[13.5px] text-muted">No activity recorded yet.</p>
              ) : (
                <ul className="mt-4 space-y-3.5">
                  {events.map((event) => (
                    <li key={event.id} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-ink">
                          {eventLabels[event.type] ?? event.type}
                        </p>
                        <p className="text-[12.5px] text-muted">
                          {formatDate(event.createdAt)}
                          {event.detail ? ` · ${event.detail}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
