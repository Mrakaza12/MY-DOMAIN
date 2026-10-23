# Ppip

A pixel-tuned recreation of the reference sign-in screen, built as a real fullstack
app with Next.js (App Router), PostgreSQL and Drizzle ORM.

## What works

- **Two-step sign-in** — enter an email address (or mobile number), press **Next**,
  and the card asks for the password. Empty or invalid fields produce inline errors.
- **Credentials stored in PostgreSQL** — sign-up (or entering a brand-new email in the
  password step) writes a real row to the `users` table. Passwords are salted and
  hashed with scrypt; the plain password is never stored.
- **Sessions** — a random token goes into an httpOnly cookie, only its SHA-256 hash is
  stored in `sessions`. Sessions expire after 30 days and are cleared on password reset.
- **Account dashboard** (`/account`) — demo balance, “Add demo funds”, peer-to-peer
  payments to other stored accounts, payment history, security activity, stored
  credential summary and a change-password form.
- **Forgotten email / forgotten password** — phone-number email lookup (masked) and a
  password reset that rewrites the stored hash.
- **Footer pages** — Contact us (messages persist in `contact_messages`), Privacy,
  Legal and Worldwide.
- **Language picker** — English (UK/US), Spanish, French, German and Portuguese, stored
  in a cookie and applied to the sign-in/sign-up copy.

## Demo accounts

| Email           | Password      | Notes                     |
| --------------- | ------------- | ------------------------- |
| `demo@ppip.com` | `Password123` | GBP, £2,500 demo balance  |
| `sam@ppip.com`  | `Password123` | USD, $1,750 demo balance  |

You can also type any new email, press **Next**, choose a password (8+ characters) and
the credentials are saved and you are signed in. The mobile number on the demo account
(`+44 7700 900123`) exercises the “Forgotten your email address?” flow.

## Stack

- Next.js 16 App Router + React 19, Tailwind CSS v4
- Drizzle ORM with PostgreSQL (`src/db/schema.ts`)
- Server actions for every mutation (`src/app/actions`)
- `npx drizzle-kit push` to sync the schema
