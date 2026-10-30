# Masjid At-Towfiq — Official Website (Design Preview)

A standalone, **masjid-only** cinematic website for Masjid At-Towfiq, Bolton. The Madrasah and its admissions/parent portals are deliberately maintained in a **separate project**.

> **IMPORTANT — PREVIEW:** Prayer times now use the named MasjidBox listing; programmes and donation actions may remain illustrative. They are not verified masjid schedules, confirmed events or payment links. Keep anti-indexing controls until the masjid approves remaining pre-launch details.

## Current release: v0.3.0 (MasjidBox live timetable)

- Responsive royal-blue, gold and ivory design with user-supplied At-Towfiq logo
- Calligraphy and bespoke CSS architectural treatments; **no AI-generated images**
- Licensed third-party real mosque photograph (Cambridge Mosque, *not* At-Towfiq) for visual direction only
- Prayer timetable design, event categories, community, visit, donations UI preview
- Mobile navigation, modal dialogs, reduced-motion support
- No backend, admin accounts, user data collection or payment processing

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

## Prayer time feature (v0.3: MasjidBox)

The live page now embeds the MasjidBox listing for Masjid At-Towfiiq: https://masjidbox.com/prayer-times/masjid-at-towfiiq. It avoids presenting generic calculated beginnings as the masjid's prayer times. A direct link remains available if framing is blocked. See [docs/PRAYER_TIMES.md](docs/PRAYER_TIMES.md).

## Cloudflare Worker build integration

The existing production deployment runs on **Cloudflare Workers**, not Pages. Repository root `wrangler.jsonc` specifies the existing Worker name and the `./public` asset directory. Under the Worker's **Settings → Builds**, connect this repository's `main` branch and set the deploy command to `npx wrangler deploy`. See `DEPLOYMENT.md` for troubleshooting and domain-preservation details.
