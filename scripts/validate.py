"""Zero-dependency structural and staging-safety checks for the static preview."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys
import json

SITE = Path(__file__).resolve().parents[1] / "public"

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.id_refs = []
        self.files = []
        self.robots_noindex = False

    def handle_starttag(self, tag, attr_list):
        attrs = dict(attr_list)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                raise ValueError(f"Duplicate HTML ID: {attrs['id']}")
            self.ids.add(attrs["id"])
        if tag == "meta" and attrs.get("name") == "robots":
            self.robots_noindex = "noindex" in attrs.get("content", "")
        for key in ("href", "src"):
            value = attrs.get(key, "")
            if not value:
                continue
            if value.startswith("#"):
                self.id_refs.append(value[1:])
            elif value.startswith(("http:", "https:", "mailto:", "tel:", "data:", "javascript:")):
                continue
            else:
                path = urlsplit(value).path.strip("/")
                if path:
                    self.files.append(path)

page = PageParser()
page.feed((SITE / "index.html").read_text(encoding="utf-8"))
problems = []
for ref in page.id_refs:
    if ref and ref not in page.ids:
        problems.append(f"Broken hash link #{ref}")
for ref in page.files:
    if not (SITE / ref).is_file():
        problems.append(f"Missing referenced file: {ref}")
if page.robots_noindex:
    problems.append("Public Masjid homepage must allow search indexing")
if '<link rel="canonical" href="https://attowfiqmasjid.org/">' not in (SITE / "index.html").read_text(encoding="utf-8"):
    problems.append("Masjid canonical URL missing")
# The separate public Madrasah site is served by the same static-assets Worker,
# while pupil/admission data remains on the existing separate secure portal.
madrasah_path = SITE / "madrasah" / "index.html"
if not madrasah_path.is_file():
    problems.append("Public Madrasah website missing")
else:
    madrasah_html = madrasah_path.read_text(encoding="utf-8")
    madrasah_page = PageParser()
    madrasah_page.feed(madrasah_html)
    for ref in madrasah_page.id_refs:
        if ref and ref not in madrasah_page.ids:
            problems.append("Broken Madrasah anchor: #"+ref)
    for ref in madrasah_page.files:
        target = SITE / ref
        if not (target.is_file() or (target.is_dir() and (target / "index.html").is_file())):
            problems.append("Missing Madrasah asset or page: "+ref)
    for expected in ["24 Punch Street", "BL3 5BJ", "01204 775864",
                     "info@attowfiiqmasjid.org", "portal.attowfiqmasjid.org",
                     'id="learning"', 'id="admissions"', 'id="families"']:
        if expected not in madrasah_html:
            problems.append("Public Madrasah detail missing: "+expected)
    if madrasah_page.robots_noindex:
        problems.append("Public Madrasah homepage must allow search indexing")
    if '<link rel="canonical" href="https://madrasah.attowfiqmasjid.org/">' not in madrasah_html:
        problems.append("Madrasah canonical URL missing")
    if "student registration form" in madrasah_html.lower():
        problems.append("Staff-only admissions must not be presented as a public submission form")
    if "Temperance Street" not in madrasah_html:
        problems.append("New building and current venue distinction missing")
if "https://madrasah.attowfiqmasjid.org/" not in (SITE / "index.html").read_text(encoding="utf-8"):
    problems.append("Masjid website does not link to the public Madrasah domain")
if "https://madrasah.attowfiqmasjid.org/" not in (SITE / "madrasah" / "index.html").read_text(encoding="utf-8"):
    problems.append("New Madrasah domain is missing from the public site")
# An admission link must be visible without scrolling and remain reachable on mobile.
if "nav-apply" not in madrasah_html or "hero-apply" not in madrasah_html:
    problems.append("Madrasah public homepage missing visible header / hero Apply for Admission buttons")
if "mobile-admissions-bar" not in madrasah_html:
    problems.append("Madrasah homepage missing persistent mobile admissions shortcut")
admissions_target='https://madrasah.attowfiqmasjid.org/apply/'
if madrasah_html.count(admissions_target)<4:
    problems.append("Madrasah admission calls-to-action must point to official online application")
if "Explore admissions" in madrasah_html:
    problems.append("Ambiguous explore-admissions CTA remains on homepage")

if "madrasah.attowfiqmasjid.org" not in (SITE.parent / "src" / "worker.mjs").read_text(encoding="utf-8"):
    problems.append("Cloudflare hostname dispatch missing")
if not (SITE / "madrasah" / "apply" / "index.html").is_file():
    problems.append("Parent-facing public admissions form missing")
for admissions_asset in ["madrasah/application.css", "madrasah/application.js"]:
    if not (SITE / admissions_asset).is_file():
        problems.append("Admissions asset missing: "+admissions_asset)
# The applicant-facing wizard must have four distinct steps and a final review.
admissions_page = (SITE / "madrasah" / "apply" / "index.html").read_text(encoding="utf-8")
application = PageParser()
application.feed(admissions_page)
for step in range(4):
    if f'data-panel="{step}"' not in admissions_page or f'data-goto-step="{step}"' not in admissions_page:
        problems.append("Four-step admission wizard missing step "+str(step+1))
for expected in ['id="madrasahAdmissionForm"', 'id="applicationReview"', 'id="submitAdmission"',
                 'id="nextStep"', 'id="backStep"', 'id="admissionAvailability"',
                 'name="guardian_email"', 'name="consent_first_aid"',
                 'name="consent_photos"', 'name="parent_confirmed"', 'id="previousInstitute"']:
    if expected not in admissions_page:
        problems.append("Online admission wizard missing required element: "+expected)
if "portal.attowfiqmasjid.org/api/public/admissions" not in (SITE / "madrasah" / "application.js").read_text(encoding="utf-8"):
    problems.append("Public admissions must submit to existing portal API")
if not application.robots_noindex:
    problems.append("Student application page must remain excluded from indexing")
for ref in application.files:
    target = SITE / ref
    if not (target.is_file() or (target.is_dir() and (target / "index.html").is_file())):
        problems.append("Missing wizard asset: "+ref)

for madrasah_asset in ["madrasah/styles.css", "madrasah/site.js", "madrasah/assets/madrasah-logo.png"]:
    if not (SITE / madrasah_asset).is_file():
        problems.append("Madrasah static asset missing: "+madrasah_asset)

if "connect-src 'self' https://portal.attowfiqmasjid.org" not in (SITE / "_headers").read_text():
    problems.append("Madrasah public application fetch would be blocked by Content Security Policy")
headers_text = (SITE / "_headers").read_text(encoding="utf-8")
if "X-Robots-Tag: noindex" not in headers_text:
    problems.append("Student admission form noindex header missing")
if "/*\n  X-Content-Type-Options:" not in headers_text:
    problems.append("Site-wide security headers missing")
if "/*\n  X-Robots-Tag: noindex" in headers_text:
    problems.append("Public websites must not use a site-wide noindex header")
for host,robots_path,sitemap_path in [
    ("attowfiqmasjid.org",SITE/"robots.txt",SITE/"sitemap.xml"),
    ("madrasah.attowfiqmasjid.org",SITE/"madrasah"/"robots.txt",SITE/"madrasah"/"sitemap.xml")
]:
    robots = robots_path.read_text(encoding="utf-8")
    sitemap = sitemap_path.read_text(encoding="utf-8")
    if "Disallow: /\n" in robots:
        problems.append(host+" still blocks all crawlers")
    if "Sitemap: https://"+host+"/sitemap.xml" not in robots:
        problems.append(host+" robots file must advertise its sitemap")
    if "<loc>https://"+host+"/</loc>" not in sitemap:
        problems.append(host+" sitemap missing canonical homepage")
    if "portal.attowfiqmasjid.org" in sitemap or "/apply/" in sitemap:
        problems.append(host+" sitemap must not include private portal or admission forms")
if "Response.redirect(\"https://madrasah.attowfiqmasjid.org\"" not in (SITE.parent/"src"/"worker.mjs").read_text():
    problems.append("Duplicate Madrasah pages need canonical hostname redirect")
html = (SITE / "index.html").read_text(encoding="utf-8")
if "WEBSITE CONCEPT PREVIEW" in html:
    problems.append("Concept-preview banner must be removed")
if "https://masjidbox.com/prayer-times/masjid-at-towfiiq" not in html or 'id="prayerDockToggle"' not in html or 'id="prayerDockRows"' not in html:
    problems.append("Native At-Towfiiq prayer dock missing")
if 'id="masjidVideosGrid"' not in html or 'id="masjidVideoDialog"' not in html or 'id="videos"' not in html:
    problems.append("Native published-video gallery is missing")
if 'id="prayer-times"' not in html:
    problems.append("Prayer times navigation anchor missing")
for service_id in ["services","service-nikah","service-counselling","service-funeral","service-sheikhs"]:
    if f'id="{service_id}"' not in html:
        problems.append(f"Masjid service anchor missing: {service_id}")
if 'class="nav-services"' not in html or 'class="mobile-services"' not in html:
    problems.append("Desktop/mobile Services dropdown missing")
if not (SITE / "services.css").is_file():
    problems.append("Services stylesheet missing")
if 'class="welcome-section' in html or 'class="services-section' in html:
    problems.append("Old community sections still present")

if 'id="give"' not in html or 'id="copyBankDetails"' not in html:
    problems.append("New masjid appeal and bank details missing")
for bank_text in ["AT-TOWFIIQ ISLAMIC AND CULTURAL CHARITY", "40-12-25", "72268922"]:
    if bank_text not in html:
        problems.append(f"Bank transfer detail missing: {bank_text}")
if "Continue to giving preview" in html or "id=\"donateAction\"" in html:
    problems.append("Obsolete donation preview must be removed")
if 'src="assets/new-masjid-temperance-street.webp"' not in html:
    problems.append("Authentic new building photograph missing")
for project_asset in ["project.css", "project.js", "assets/new-masjid-temperance-street.webp"]:
    if not (SITE / project_asset).is_file():
        problems.append("New masjid project asset missing: "+project_asset)

for asset in ["videos.css","videos.js"]:
    if not (SITE / asset).is_file():
        problems.append("Website video asset missing: "+asset)
# Ensure external MasjidBox link remains available even if an iframe is blocked.
if html.count('href="https://masjidbox.com/prayer-times/masjid-at-towfiiq"') < 1:
    problems.append("Fallback link to At-Towfiiq MasjidBox missing")
if 'id="masjidboxTimetable"' in html or 'src="https://masjidbox.com' in html:
    problems.append("MasjidBox iframe must not appear in native prayer interface")
if not (SITE / "prayer-live.js").is_file():
    problems.append("Native prayer UI JavaScript missing")
if 'prayer-times.js' in html or 'api.aladhan.com' in html:
    problems.append("Legacy calculated timetable still loaded")
# Cloudflare Workers Builds must target this *existing* Worker, not create a Pages project.
wrangler_path = SITE.parent / "wrangler.jsonc"
if not wrangler_path.is_file():
    problems.append("Cloudflare Workers configuration missing: wrangler.jsonc")
else:
    try:
        wrangler = json.loads(wrangler_path.read_text(encoding="utf-8"))
        if wrangler.get("name") != "masjid-at-towfiq-website":
            problems.append("Wrangler name does not match the existing Cloudflare Worker")
        if wrangler.get("assets", {}).get("directory", "").rstrip("/") not in ("./public", "public"):
            problems.append("Wrangler static asset directory must be ./public")
        if wrangler.get("main") != "./src/worker.mjs":
            problems.append("Prayer feed Worker entrypoint missing")
        if wrangler.get("assets", {}).get("binding") != "ASSETS":
            problems.append("Cloudflare ASSETS binding missing")
        if wrangler.get("assets", {}).get("run_worker_first") is not True:
            problems.append("All-requests Worker routing must be enabled to dispatch the Madrasah hostname")
        if "routes" in wrangler or "route" in wrangler:
            problems.append("Routes should remain managed in the Cloudflare dashboard")
        if wrangler.get("workers_dev") is not False:
            problems.append("workers_dev should remain false for dashboard-managed routes")
    except (ValueError, TypeError, AttributeError) as exc:
        problems.append(f"Invalid Wrangler configuration: {exc}")
if problems:
    print("FAILED:\n" + "\n".join(f" - {p}" for p in problems))
    sys.exit(1)
print(f"PASS: {len(page.ids)} IDs, {len(page.id_refs)} anchors, {len(page.files)} local assets; public SEO and protected admission checks passed.")
