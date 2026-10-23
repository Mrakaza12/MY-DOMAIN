# Keyline

A small, honest sign-in app: email + password accounts stored in PostgreSQL,
sessions in an httpOnly cookie, and a dashboard showing your own sign-in
activity.

> This repository previously contained a look-alike of a well-known payment
> provider's sign-in screen. That has been removed — it was replaced by this
> original app with its own branding, which stores accounts you own rather than
> collecting credentials for an existing service.

## What it does

- **Sign up** — email, optional display name, password (8+ characters).
  Passwords are salted and hashed with scrypt; the plain password is never stored.
- **Sign in** — verified against the stored hash with a constant-time compare.
  A generic “Email or password is incorrect.” avoids leaking which emails exist.
- **Sessions** — a random 32-byte token in an `httpOnly`, `SameSite=Lax` cookie.
  Only its SHA-256 hash is stored in the `sessions` table, and it expires after 30 days.
- **Dashboard** — your email, member-since date and recent sign-in activity,
  plus sign-out.
- **Throttling** — ten failed attempts per email/IP per ten minutes.

## Stack

- Next.js 16 (App Router) + React 19, Tailwind CSS v4
- PostgreSQL via Drizzle ORM (`src/lib/schema.ts`)
- Route handlers for every mutation (`src/app/api/auth/*`)

## Run it locally

```bash
npm install
cp .env.example .env.local   # DATABASE_URL can stay empty
npm run dev
```

With `DATABASE_URL` empty, the app uses **PGlite** — Postgres compiled to
WebAssembly — and stores data in `./.data/pglite`. No database server needed.
The tables are created automatically on first request.

To use a real Postgres locally (or Neon, Supabase, RDS…), set `DATABASE_URL` in
`.env.local` and run `npm run db:push` if you want Drizzle to manage the schema.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mrakaza12/MY-DOMAIN)

The button creates a Vercel project from this repository. You still need to add
a `DATABASE_URL` pointing at a Postgres database (Neon has a free tier) before
the first deploy is usable — see **[DEPLOY.md](./DEPLOY.md)** for the exact steps.

## Changing the name

Set `NEXT_PUBLIC_SITE_NAME` (for example in Vercel → Settings → Environment
Variables) and redeploy — no code changes required.
