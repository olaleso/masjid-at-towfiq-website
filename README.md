# Masjid At-Towfiq — Official Website (Design Preview)

A standalone, **masjid-only** cinematic website for Masjid At-Towfiq, Bolton. The Madrasah and its admissions/parent portals are deliberately maintained in a **separate project**.

> **IMPORTANT — PREVIEW:** Prayer times now use the named MasjidBox listing; programmes and donation actions may remain illustrative. They are not verified masjid schedules, confirmed events or payment links. Keep anti-indexing controls until the masjid approves remaining pre-launch details.

## Current release: v0.3.0 (MasjidBox live timetable)

- Responsive royal-blue, gold and ivory design with user-supplied At-Towfiq logo
- Calligraphy and bespoke CSS architectural treatments; **no AI-generated images**
- Licensed third-party real mosque photograph (Cambridge Mosque, *not* At-Towfiq) for visual direction only
- Prayer timetable design, event categories, community, visit, donations UI preview
- Mobile navigation, modal dialogs, reduced-motion support
- A small read-only Worker prayer-time API; no admin accounts, user data collection or payment processing

## Project structure

```text
public/                    Cloudflare Workers static assets (entire published site)
  index.html
  styles.css
  script.js
  assets/at-towfiq-logo.png
  _headers               Security headers and temporary noindex
  robots.txt             Temporary noindex for public preview
scripts/validate.py       No-dependency structural validation
.github/workflows/validate.yml
DEPLOYMENT.md             GitHub → Cloudflare Workers setup
LAUNCH_CHECKLIST.md       Production-readiness tasks
docs/CREATIVE_CONCEPT.md   Design research, licences and roadmap
```

## Preview locally

Open `public/index.html` directly in a browser, or from the root:

```sh
python3 -m http.server 8788 --directory public
# http://localhost:8788
```

## Validate

```sh
python3 scripts/validate.py
node --check public/script.js
```

## Deploy to Cloudflare Workers

Choose **GitHub integration**, not Direct Upload, so every approved `main` commit will automatically deploy. See [DEPLOYMENT.md](DEPLOYMENT.md) for exact setup details. No framework build or database is needed for the static preview; Cloudflare Workers assets directory is `./public`.

## Asset rights and corrections

The logo is supplied by the masjid and should not be reused in unrelated projects. A real photo by Rumman Amin is loaded from Unsplash for this concept; it depicts Cambridge Central Mosque, not Masjid At-Towfiq. See `docs/CREATIVE_CONCEPT.md` for the external image and font credits. Replace the photograph with consent-cleared real At-Towfiq images before launch. No third-party photograph is stored in the repo.

**Project status:** Pre-launch template. Content and contact details require final masjid sign-off.

## Prayer time feature (v0.4: native live timetable)

The native hero iqamah bar and detailed timetable use a server-side MasjidBox reader in the existing Cloudflare Worker. It retrieves published times for **Masjid At-Towfiiq**, not Al-Hidaya, without embedding MasjidBox's webpage or inventing generic prayer starts. See [docs/PRAYER_TIMES.md](docs/PRAYER_TIMES.md).

## Cloudflare Worker build integration

The existing production deployment runs on **Cloudflare Workers**, not Pages. Repository root `wrangler.jsonc` specifies the existing Worker name and the `./public` asset directory. Under the Worker's **Settings → Builds**, connect this repository's `main` branch and set the deploy command to `npx wrangler deploy`. See `DEPLOYMENT.md` for troubleshooting and domain-preservation details.


## Video library published from the Madrasah portal

The previous redundant full-page prayer card has been replaced with a native **Lectures & Khutbahs** section. The compact hero prayer dock and its drilldown remain available. The new section shows curated YouTube thumbnail cards, category filters, an optional featured video and a privacy-conscious click-to-play player. It never auto-plays on page load.

The **admin source of truth** is the separate portal at `https://portal.attowfiqmasjid.org/`, under **Community → Website videos**. Only published entries are returned by `GET https://portal.attowfiqmasjid.org/api/public/masjid-videos`. The masjid Worker exposes the same data from `GET /api/public/videos` after validating the public metadata. No portal private data, API tokens, YouTube credentials or editor actions are exposed by the public website.

When the portal API is unavailable, the section shows a link to the masjid's public YouTube channel instead of inventing recordings or keeping obsolete cached video listings. No database migration or subsequent website rebuild is needed when an administrator adds a video. The portal source code itself must first be deployed once.

## New Masjid building appeal

The previous non-functional donation preview has been replaced by a factual project update at `#give` / `#new-masjid`. It displays a real photograph cropped from the community's June announcement, distinguishes the **new Temperance Street project** from the present Punch Street worship address, and reproduces the supplied charitable bank-transfer details with copy controls. No payment processing or bank login is performed.

**Bank details** were sourced from the charity's supplied earlier appeal, not independently confirmed against current bank records. The website asks visitors to verify with the charity. Historic appeal targets, amounts raised and deadlines are deliberately omitted because they cannot be assumed to be current following the announced property milestone. Update project status and bank account details only with trustees' confirmation.
