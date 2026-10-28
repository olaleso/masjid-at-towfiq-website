# Masjid At-Towfiq · Prayer-times implementation, v1

This is a **pre-launch reference feature**, not an approved source of congregational prayer timings. It maintains a strict distinction between estimated/calculated **beginnings (adhan)** and masjid-approved **jama'ah (iqamah)** times.

## What has been implemented

- Daily calculation from the documented [AlAdhan API](https://aladhan.com/prayer-times-api) for the Bolton area, with 24-hour clock and **Europe/London GMT/BST** handling.
- Date picker (previous, today, next), real-time next **beginning** countdown with rollover to tomorrow, and automatic change at local midnight.
- Sunrise, the five salah starts, accessible monthly calendar dialog, and reference CSV export.
- App fails closed if a calculated timetable cannot be retrieved; it does not show hardcoded plausible prayer times or pretend to know jama'ah.
- Official masjid-approved daily schedule can override calculations and supply all jama'ah and Friday Jumu'ah times.
- Link to an independent public listing for At-Towfiiq as an additional cross-check. This is not represented as a verified source or integrated automatically.

## Calculation conventions **not yet authorised**

`public/data/prayer-config.json` currently selects `method: 3` (Muslim World League), `school: 1` (Hanafi Asr), with latitude adjustment method 3 (angle-based); these are **provisional reference settings only**. At high UK latitudes Fajr and Isha can differ substantially across legitimate authorities and seasons. The committee must specify its adopted methodology or furnish the official annual/monthly schedule. Do not use calculated beginnings as the masjid's approved times without comparing against its official timetable.

## Publishing approved beginning + jama'ah times

1. Obtain the actual committee-approved monthly PDF/Excel timetable (including Jumu'ah arrangements and DST date changes). Have the masjid confirm changes by an authorised person.
2. Edit `public/data/prayer-config.json`. Set `official.approvedByMasjid` to `true` and `official.reviewedAt` to the actual ISO date (e.g. `2026-10-28`) **only after verification**.
3. Add individual dates under `official.days` with `status: "approved"`, six start times and five jama'ah times, each in 24-hour `HH:MM`. Supply `jumuah` for verified Fridays only. Do not populate invented or estimated jama'ah times.
4. Open a pull request for peer review. GitHub CI validates the JSON and structure. Merge to `main` only after checking with the official schedule; Cloudflare Pages auto-deploys.

Entry *structure* (values below are deliberately placeholder strings, not real prayer times):

```json
"2026-11-01": {
  "status": "approved",
  "begins": { "Fajr": "HH:MM", "Sunrise": "HH:MM", "Dhuhr": "HH:MM", "Asr": "HH:MM", "Maghrib": "HH:MM", "Isha": "HH:MM" },
  "jamaah": { "Fajr": "HH:MM", "Dhuhr": "HH:MM", "Asr": "HH:MM", "Maghrib": "HH:MM", "Isha": "HH:MM" }
}
```

**All** fields on an approved date are mandatory. Missing/invalid values reject that date rather than mixing approved and unapproved records under a misleading label. `jumuah` is an optional additional `HH:MM` field on Fridays only, when committee approved.

## Source and tech notes

- **Reference source:** `api.aladhan.com/v1/timings/{DD-MM-YYYY}` for individual days and `/v1/calendar/{year}/{month}` for full months.
- Reference times are computed for Bolton-area coordinates and not the individual prayer halls, and can differ from official masjid timetables. No fake data is shown when the remote API is unavailable.
- External `fetch` origin is permitted by Cloudflare Pages' `public/_headers` Content Security Policy.
- This is intentionally no-login/no-database; the existing GitHub repository is used as the temporary editorial approval system. An authenticated Cloudflare Workers + D1 admin panel and CSV/PDF import are the next phase.
- Monthly CSV filenames include `reference-not-official` so an unverified schedule is not mistakenly forwarded as official.
- No donation, Madrasah, email or other website components are altered by this feature.

## Testing

Run `python3 scripts/validate.py`, `node --check public/script.js`, and `node --check public/prayer-times.js`. Check browser network for API/CORS failures, as well as a mobile viewport. Compare daily/monthly dates around 29 March and 25 October 2026 (UK clock changes) and check changes to jama'ah only after timetable approval. Avoid relying on the current provisional reference timings for congregational attendance.

## Next iteration

Build a one-admin timetable management screen with secure sign-in and an approval audit trail, monthly CSV upload, bulk validation, Ramadan adjustments, Jumu'ah sessions, a printable authorised monthly PDF, and optional masjid hall display.
