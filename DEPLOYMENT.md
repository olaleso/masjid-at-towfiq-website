# Masjid At-Towfiq — Cloudflare Workers deployment

**Actual production setup (28 October 2026):** The project is a **Cloudflare Worker**, named `masjid-at-towfiq-website`, serving `https://attowfiqmasjid.org/`. It is **not** a Cloudflare Pages project.

The static assets are in `public/`; `wrangler.jsonc` at the repository root tells Wrangler to deploy them as Workers Static Assets. This file uses the *exact* Worker name, as required by Cloudflare Workers Builds.

## GitHub source

- GitHub repository: https://github.com/olaleso/masjid-at-towfiq-website
- Production branch: `main`
- Worker name: `masjid-at-towfiq-website`
- Assets directory: `./public`
- Root directory: repository root
- No framework compilation is needed.

## One-time Cloudflare dashboard configuration

1. Open **Workers & Pages → masjid-at-towfiq-website → Settings → Builds** in the existing Cloudflare account.
2. Under **Git repository**, confirm the connected repository is exactly `olaleso/masjid-at-towfiq-website`. This matters because GitHub Actions passing **does not** mean Cloudflare ran a deployment.
3. If it is disconnected or points to a different repository, use **Connect**, or disconnect and reconnect the **same existing Worker**, selecting the proper GitHub account/repository. Do **not** create another Pages project or Worker.
4. Under **Build configuration**, use:
   - Production branch: `main`
   - Root directory: empty / repository root
   - Build command: empty (no compile step required)
   - **Deploy command: `npx wrangler deploy`**
   - Preview command: Cloudflare default, if enabled
5. Under **Build watch paths**, include all paths (`*`) and do not exclude `public/*` or `wrangler.jsonc`. Make sure builds are **enabled**.
6. Save settings. Push a change to `main` or use the **Build → Retry** action for a suitable build. Under **Deployments**, look for a new build tied to the GitHub commit (not only an older dashboard/manual deployment).
7. Open `https://attowfiqmasjid.org/prayer-times.js` and `https://attowfiqmasjid.org/data/prayer-config.json` to check the new static assets. Do not assume deployment has completed until these URLs are served by the same Worker at the domain.

## Domain and safety

The domain `attowfiqmasjid.org` is already routed to the Worker in Cloudflare's dashboard. The `wrangler.jsonc` intentionally does **not** declare `route` or `routes`, and includes `workers_dev: false`, to keep routes/domain managed by the Cloudflare dashboard rather than trying to create or replace them in deployment. Do not alter **Domains & Routes** for this update.

`keep_vars: true` preserves dashboard-maintained non-secret environment variables when deploying. Never commit API tokens or credentials.

The site's `public/_headers` protects static asset responses and `robots.txt` continues to discourage indexing while prayer timings are unverified. **Do not** remove the labels distinguishing calculated prayer beginnings from officially approved jama'ah and Jumu'ah.

## Future updates

After changes are merged to `main`, Workers Builds should run automatically and execute `npx wrangler deploy`, uploading the entire `public/` directory. Verify both GitHub CI and Cloudflare's **Workers Builds** result.

If no Cloudflare build starts after a new GitHub commit:
- Open **Settings → Builds** and check **Git repository**, **Branch control**, **Build watch paths**, and whether automatic builds are enabled.
- Under **Deployments**, inspect **Build History** rather than interpreting a green GitHub Actions check as a Cloudflare deployment.
- If GitHub integration is broken, reconnect the existing Worker to the repository (Cloudflare documents this recovery in its Builds troubleshooting section).

If a build starts but fails, inspect the **Build** link and full deployment logs. The Worker `name` in `wrangler.jsonc` must exactly match the dashboard Worker name.

Official references:
- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/wrangler/configuration/
