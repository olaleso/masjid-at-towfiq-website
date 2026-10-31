# Local SEO — Masjid & Madrasah At-Towfiq

## Canonical public properties (31 October 2026)

| Property | Canonical URL | Structured type |
| --- | --- | --- |
| Masjid At-Towfiq | https://attowfiqmasjid.org/ | [schema.org/Mosque](https://schema.org/Mosque) |
| Madrasah At-Towfiq | https://madrasah.attowfiqmasjid.org/ | [schema.org/EducationalOrganization](https://schema.org/EducationalOrganization) |

Both websites are served through the existing `masjid-at-towfiq-website` Cloudflare Worker, dispatched by hostname. The secure login is separately hosted at `https://portal.attowfiqmasjid.org/`.

**Confirmed current shared contact details (as published on the existing websites):**

- Name: Masjid At-Towfiq and Madrasah At-Towfiq (separate public entities)
- Current public venue: **24 Punch Street, Bolton BL3 5BJ, United Kingdom**
- Telephone: **01204 775864** (international **+44 1204 775864**)
- Public contact email: **info@attowfiiqmasjid.org**
- Masjid YouTube channel: https://www.youtube.com/@AttowfiqmasjidBolton
- New masjid *project* at Temperance Street, Bolton: **NOT a current public visiting or teaching venue**; do not substitute for Punch Street until an officially announced move.

## Implemented on the websites

1. Natural Bolton-specific titles and descriptive meta summaries on each homepage.
2. Visible location- and learning-relevant text (not hidden keyword spam), with a clear current venue, phone, email and directions link.
3. Structured JSON-LD graphs: **Mosque** for the masjid; **EducationalOrganization** for the madrasah; matching **WebSite** and **WebPage** nodes. JSON-LD uses the same public, current contact details. No unverified opening hours, fee amounts, school-age limits, ratings, geographic coordinates or timetable assertions.
4. Strict Content Security Policy retained. Exactly two SHA-256 hashes allow only the two JSON-LD data blocks without enabling arbitrary inline scripts. Recompute the hashes and update `public/_headers` if either schema block is edited; `scripts/validate.py` checks this automatically.
5. Two separate, existing XML sitemaps and canonical URLs are retained:
   - https://attowfiqmasjid.org/sitemap.xml
   - https://madrasah.attowfiqmasjid.org/sitemap.xml
6. The admissions form at https://madrasah.attowfiqmasjid.org/apply/ remains **noindex** by design and accepts sensitive data only through the secure portal API.

## Google Search Console

Ownership of the domain has already been verified and the three sitemaps have already been accepted. No need to submit the same sitemaps again merely because these page titles and structured data have changed.

After deployment, verify each public homepage in Google's [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/) and inspect the live HTML in Search Console. The validator recognizes Schema.org structures more broadly than Google's eligible rich-result types; neither tool can guarantee a local search feature or ranking.

## Google Business Profile (separate manual task)

Website schema **does not create or claim a Google Business Profile**. If the Masjid and Madrasah each independently meet Google's in-person eligibility criteria, an authorized representative should search Google Maps for an existing listing before creating a new one. Claim and verify the existing listing when applicable; avoid duplicate profiles for the same physical service or community.

For any eligible listing, keep name/category/phone/site/current venue consistent with the official published information. Enter *only confirmed* opening/lesson hours and use authentic exterior photos of the current Punch Street venue. Do not use a photograph of the *future* Temperance Street project as if it were the current premises.

Google Business Profile eligibility: https://support.google.com/business/answer/13763036?hl=en-GB

## Follow-up content once trustees confirm it

- Actual congregation/visiting hours and separate Madrasah class hours, where approved.
- Whether the Masjid and Madrasah have independent official Google Maps listings.
- Current venue exterior photographs and accessibility information.
- A verified address change when the project moves, followed by website, schema, listing and map updates together.

Do not generate fictitious reviews, near-duplicate doorway pages for surrounding towns, unsupported "best school" claims, or misleading enrolment promises.
