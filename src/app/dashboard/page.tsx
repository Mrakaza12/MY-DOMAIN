import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/SignOutButton";
import { Logo, Wordmark } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginEvents } from "@/lib/schema";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your account" };

const outcomeLabels: Record<string, string> = {
  signup: "Account created",
  success: "Signed in",
  failed: "Failed sign-in attempt",
  logout: "Signed out",
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const database = await db();
  const events = await database
    .select({
      id: loginEvents.id,
      outcome: loginEvents.outcome,
      ipAddress: loginEvents.ipAddress,
      createdAt: loginEvents.createdAt,
    })
    .from(loginEvents)
    .where(eq(loginEvents.userId, user.id))
    .orderBy(desc(loginEvents.createdAt))
    .limit(8);

  const name = user.displayName?.split(" ")[0] || null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 pt-8 sm:px-10">
        <Link href="/dashboard" className="inline-flex items-center gap-3">
          <Logo />
          <Wordmark />
        </Link>
        <SignOutButton />
      </header>

      <main className="mx-auto w-full max-w-[720px] flex-1 px-5 py-10 sm:px-6 sm:py-14">
        <section className="rise-in rounded-2xl border border-line bg-white p-7 shadow-[0_18px_50px_-34px_rgba(16,20,24,0.35)] sm:p-9">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand">
            Signed in
          </p>
          <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.02em] text-ink">
            {name ? `Welcome, ${name}` : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">{user.email}</p>

          <dl className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-muted">
                Member since
              </dt>
              <dd className="mt-1 text-[15px] text-body">{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-muted">
                Password storage
              </dt>
              <dd className="mt-1 text-[15px] text-body">
                scrypt hash — the plain password is never saved
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-white p-7 sm:p-9">
          <h2 className="text-[17px] font-semibold text-ink">Recent sign-in activity</h2>
          <p className="mt-1 text-[14px] text-muted">
            Stored server-side in Postgres, alongside your account.
          </p>

          {events.length === 0 ? (
            <p className="mt-5 rounded-xl bg-canvas px-4 py-5 text-[14px] text-muted">
              No activity recorded yet.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3"
                >
                  <span className="text-[14.5px] font-medium text-body">
                    {outcomeLabels[event.outcome] ?? event.outcome}
                  </span>
                  <span className="text-[13px] text-muted">
                    {formatDateTime(event.createdAt)}
                    {event.ipAddress ? ` · ${event.ipAddress}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="px-6 pb-8 text-center text-[12.5px] text-muted">
        This is a demo app — no money, payments or financial data are involved.
      </footer>
    </div>
  );
}
