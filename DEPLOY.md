# Deployment

The app is a static export, deployed to GitHub Pages by a GitHub Actions
workflow. No external accounts, secrets or database are needed.

- **Live URL:** <https://mrakaza12.github.io/MY-DOMAIN/>
- **Workflow:** `.github/workflows/deploy-pages.yml`

## How it works

1. A push to `main` (or a manual run) starts the workflow.
2. `npm ci` then `npm run build` produces the static site in `out/`.
3. `upload-pages-artifact` packages `out/`, and `deploy-pages` publishes it.
4. GitHub serves it at the repository's Pages URL.

## First-time repository settings

Under **Settings → Pages → Build and deployment**:

- **Source:** *GitHub Actions*

That's the only setting. The old *Deploy from a branch* mode would try to serve
the raw repository instead of the built site.

## Updating the site

```bash
git add -A
git commit -m "…"
git push origin main
```

Watch progress under the **Actions** tab. The deploy takes about a minute.

## Changing the address or name

- **Rename the repo** → update `basePath` in `next.config.ts` to match
  (`/NEW-NAME`), or set it to `""` if you move to a custom domain.
- **Custom domain** → set `basePath: ""`, add a `public/CNAME` file containing
  the domain, and configure DNS as GitHub describes.
- **Product name** → edit `SITE_NAME` in `src/lib/site.ts`.

## Rolling back

Pages keeps the deployment history. **Settings → Environments → github-pages**
lists previous deployments, any of which can be re-deployed. Alternatively,
revert the commit on `main` and let the workflow run again.

## Limitations to keep in mind

This is a static site, so accounts live in each visitor's browser
(`localStorage`). There is no server, no shared database and no way to sign in
from a second device. If you later want real cross-device accounts, the earlier
Postgres implementation is still in the git history (commit `6142ab1`) and needs
a Node host such as Vercel plus a database such as Neon.
