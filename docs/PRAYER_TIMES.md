# Masjid At-Towfiiq · native live prayer timetable

**Public MasjidBox source:** https://masjidbox.com/prayer-times/masjid-at-towfiiq (24 Punch Street, Bolton).

Adapted from the user's supplied Al-Hidaya implementation:
- `src/worker.mjs` handles `GET /api/public/prayer-times` on the same Cloudflare Worker hosting the static website.
- It fetches the At-Towfiiq MasjidBox public page server-side, extracts `window.REDUX_STATE`, supports encoded `%uXXXX` Arabic characters, and finds the exact UK-local date in `masjidbox.masjidboxAthany.timetable`.
- It returns five Athan and iqamah pairs, Jumu'ah where published, next iqamah, and the published verification flag as JSON. The endpoint does **not** expose MasjidBox HTML to visitors.
- `public/prayer-live.js` renders the data into a native At-Towfiiq navy/gold floating hero bar, expandable timetable and main prayer card. No MasjidBox iframe remains.
- The page periodically refreshes. Missing entries (including MasjidBox `00:00` placeholders) render as a dash rather than invented timings. A stale or unavailable feed produces a visible failure message and direct link.

`wrangler.jsonc` uses the existing Worker name `masjid-at-towfiq-website`, with `main: "./src/worker.mjs"`, `assets.binding: "ASSETS"` and `assets.run_worker_first: ["/api/*"]`. No route or DNS changes are required.

**Integration caveat:** This is the same HTML-embedded Redux state technique used by Al-Hidaya, **not a documented public MasjidBox API**. If MasjidBox changes its page or limits server-side fetches, it can break. A documented MasjidBox export or official widget is a more durable future source. Visitors always have a direct MasjidBox link.

**Validation:** `python3 scripts/validate.py`, `node --check src/worker.mjs`, `node --check public/prayer-live.js`, `node --test tests/prayer-feed.test.mjs`. Tests cover legacy encoded state, date rollover and invalid Maghrib placeholders, but live upstream availability must be checked through `https://attowfiqmasjid.org/api/public/prayer-times`.
