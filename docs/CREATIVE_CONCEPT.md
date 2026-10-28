# Masjid At-Towfiq — Cinematic Website Concept

A bespoke, responsive, **front-end design prototype** for a masjid-first website. This is NOT yet a live, approved mosque services system.

## Quick preview
Open `index.html` in a modern web browser. Deploy this folder as a static site on Cloudflare Pages or any static host. There is no Node build step or server dependency.

## Brand / creative direction
- Original user-supplied Masjid At-Towfiq logo is used unmodified at `assets/at-towfiq-logo.png`.
- Colours: At-Towfiq royal blue, dark navy, soft gold and ivory.
- Typography: Playfair Display, Manrope and Amiri (Google Fonts CDN; local fallbacks provided).
- Editorial, cinematic styling: layered lighting, custom architectural arches, subtle ornamental geometry, real Arabic phrases, gentle scroll reveals and responsive layout.
- NO AI-generated photographs or imagery. Architectural ornaments are created with CSS. One verified real editorial photograph is linked from Unsplash, depicting **Cambridge Mosque, NOT Masjid At-Towfiq**; this MUST be replaced with the masjid's own approved photo before production launch.

## Important design-demo-only components
- Five daily prayer times are **illustrative, NOT verified, and NOT suitable for prayer guidance**. A highly visible disclaimer is embedded beside the times and in the top banner. Replace all sample times with masjid-approved start and jama'ah schedules before launch.
- Programme cards describe recommended sections only, NOT confirmed events.
- Giving form is a functioning *UI preview only*. It processes no payments, stores no card data, and claims no Gift Aid on behalf of the charity.
- Subscribe button is conceptual: it opens an explanatory dialog; it does not collect subscriber data.
- Madrasah button opens an explanatory dialog pending the dedicated Madrasah website URL. There is deliberately no madrasah dashboard or admissions portal here.

## Verified background
- At-Towfiiq Islamic and Cultural Charity, registered charity no. 1147347.
- Address: 24 Punch Street, Bolton, BL3 5BJ.
- Contact: info@attowfiiqmasjid.org; telephone 01204 775864.
- Charity records describe religious celebrations and communal iftars, Islamic education, youth/elder programmes and community welfare.
- Source: [UK Charity Commission](https://register-of-charities.charitycommission.gov.uk/en/charity-search/-/charity-details/5018111/contact-information).

## Image / font licences
- Editorial background photograph: Rumman Amin, [Cambridge Central Mosque image on Unsplash](https://unsplash.com/fr/photos/interieur-de-la-mosquee-sMB8l9j1PQ8) and its [Unsplash license](https://unsplash.com/license). The source image depicts an actual third-party mosque; it is not presented as At-Towfiq's building. It is loaded from Unsplash CDN for preview and may require an internet connection.
- Source image and photographer should be reviewed and proper attribution retained or updated as the team approves imagery.
- Font families via Google Fonts under their own open-source licences.

## Proposed production roadmap
**Phase 1:** Confirm logo, imagery, copy, opening facilities, verified prayer/Jumu'ah schedules, trust details, madrasah URL and donation channels. Create separate content pages, mobile performance, accessibility, SEO, structured data, website privacy/cookies, favicons, local-photo library.

**Phase 2:** Admin portal with one trusted administrator (optionally delegated editors), timetable CSV/PDF import and approval; events/announcements; sermon archive; email/WhatsApp opt-in with consent; contact forms with spam protection.

**Phase 3:** Secure payment integration, UK Gift Aid declaration if eligible, recurring donations and funds; automated reminders; digital prayer display / TV mode; Ramadan / Eid calendar; multilingual information with verified translation; live stream only if the masjid provides one.

## Pre-launch security checklist
- Cloudflare Pages for static, Workers and D1 (optional) for backend.
- Stripe Checkout / equivalent verified payment pages; no raw card data collection.
- GDPR / UK Data Protection Act 2018 privacy information, retention & consent.
- Accessibility WCAG 2.2 AA, mobile and reduced-motion audits.
- Admin MFA, role-based access, change logs for prayer times and announcements.
- Verify donation/Gift Aid charity eligibility, safeguarding, photo permission and actual venue facilities.
