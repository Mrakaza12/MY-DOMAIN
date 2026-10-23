# Deploying to Vercel + Neon

GitHub Pages cannot host this app: it needs a Node server and a PostgreSQL
database. Vercel runs the app, Neon hosts the database — both have free tiers.

## 1. Create the database (Neon, free)

1. Sign in at <https://console.neon.tech> and choose **New project**.
2. Pick a region close to your users and create it.
3. On the project dashboard, open **Connect** and copy the connection string.
   It looks like:

   ```
   postgresql://user:password@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

   Use the **pooled** string (the host contains `-pooler`) — it suits serverless
   functions. Keep `?sslmode=require` on the end.

You do not need to create tables by hand: the app creates `users`, `sessions`
and `login_events` the first time it connects.

## 2. Deploy (Vercel, free)

1. Sign in at <https://vercel.com> with GitHub.
2. **Add New → Project**, import `Mrakaza12/MY-DOMAIN`.
3. Framework preset: **Next.js**. Root directory: `./`. Leave the build
   settings untouched.
4. Open **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon connection string from step 1 |
   | `NEXT_PUBLIC_SITE_NAME` | the name you want in the header (optional) |

5. Click **Deploy**. The first build takes a minute or two.

Your app is then live at `https://<project>.vercel.app`. Every push to `main`
redeploys it.

## 3. Check it works

- Open the deployment URL → you should land on **/login**.
- Create an account at **/signup**, then reload **/dashboard** to confirm the
  session persists.
- Sign out, sign back in with the same credentials.

If sign-up returns “We couldn't create your account”, check the Vercel
function logs — the usual cause is a missing or malformed `DATABASE_URL`.

## Notes

- **Custom domain:** Vercel → Project → Settings → Domains. Add the domain and
  point its DNS records at Vercel as instructed there.
- **GitHub Pages:** the repository root contains a single static `index.html`
  that introduces the project — GitHub Pages serves that, which is why the URL
  is no longer a 404. The actual app lives on Vercel; once it is deployed,
  replace the two GitHub links in `index.html` with your deployment URL if you
  want the Pages page to point at it.
- **Going further:** use `npx drizzle-kit generate` + `migrate` if you want
  versioned migrations instead of the automatic table creation, and move the
  rate limiter in `src/lib/rate-limit.ts` to Redis for multi-instance accuracy.
