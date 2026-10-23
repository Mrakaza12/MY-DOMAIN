# Keyline

A small sign-in app, published as a static site on GitHub Pages:
**<https://mrakaza12.github.io/MY-DOMAIN/>**

Sign up, sign in, land on a dashboard, sign out. Passwords are salted and
stretched with PBKDF2-HMAC-SHA256 (210,000 iterations) via WebCrypto before
anything is written to `localStorage`.

## What is real, and what is not

| | |
|---|---|
| Password hashing | Real — PBKDF2-SHA256, random 16-byte salt per account, constant-time compare |
| Accounts | Stored in **this browser only** (`localStorage`) — no server |
| Sessions | 30-day expiry, held in `localStorage` |
| Throttling | 10 failed attempts per email per 10 minutes, tracked in the browser |
| Sign-in activity | Local history for the current account |

Because the whole app is static, there is no server to authenticate against.
An account created in one browser cannot sign in from another, and clearing
site data deletes it. That is the trade-off for hosting entirely on GitHub
Pages — **use a throwaway password, never one you use elsewhere.**

## Routes

- `/` — sign in (sends you to the dashboard if a session exists)
- `/signup/` — create an account
- `/dashboard/` — session-guarded account page

## Stack

- Next.js 16 App Router with `output: "export"` (static HTML, no server runtime)
- React 19 + Tailwind CSS v4
- WebCrypto PBKDF2 for password hashing

## Local development

```bash
npm install
npm run dev          # http://localhost:3000/MY-DOMAIN/
```

To preview the real static export (what GitHub Pages serves):

```bash
npm run build
npm run preview      # http://localhost:4000/MY-DOMAIN/
```

## Deployment

`.github/workflows/deploy-pages.yml` builds the site and publishes `out/` to
GitHub Pages on every push to `main`. Pages is configured with **Build and
deployment → Source: GitHub Actions**.

The `basePath` is `/MY-DOMAIN` in `next.config.ts`. If you rename the
repository, change that value too.

## History

An earlier revision of this repository contained a look-alike of a payment
provider's sign-in screen that stored any typed password. It has been removed.
