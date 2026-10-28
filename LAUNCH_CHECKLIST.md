# Launch checklist — Masjid At-Towfiq

## Required before publishing as official live service

- [ ] Confirm exact masjid name, postal address, charity registration and contact channels.
- [ ] Replace **all illustrative prayer and jama'ah times** with approved data; configure dates / daylight savings and updates.
- [ ] Confirm Jumu'ah khutbah and iqamah times, holidays, Ramadan and Eid arrangements.
- [ ] Verify each event, staff role, service, accessibility claim and programme description.
- [ ] Replace Cambridge Mosque Unsplash concept photo with permission-cleared photos of At-Towfiq.
- [ ] Receive approved Madrasah site URL and replace demo modal with external hyperlink.
- [ ] Approve official donation method and Gift Aid handling (if eligible); enable receipts only after payment testing.
- [ ] Implement privacy policy, contact routes and UK GDPR retention policy before gathering user data.
- [ ] Test accessibility (WCAG 2.2 AA), mobile sizes, screen readers, language direction and reduced-motion behaviour.
- [ ] Review the entire site in browsers and test response headers, navigation, keyboard focus, SEO and performance.
- [ ] Decide domain and verify Cloudflare DNS without touching current Madrasah routes.
- [ ] Only after final approval: remove `<meta name="robots" content="noindex...">`, `X-Robots-Tag: noindex` from `public/_headers`, and `Disallow: /` from `public/robots.txt`. Consider adding a sitemap and verified `schema.org` organization data.

## Proposed subsequent phases

1. Content, imagery, global navigation and real prayer data
2. Simple single-admin publishing for notices, timetable, events and programmes
3. Secure opt-in email, event registrations and charity-approved donations
4. Ramadan/Eid experiences and optional public prayer display
