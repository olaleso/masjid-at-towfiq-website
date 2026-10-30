"""Zero-dependency structural and staging-safety checks for the static preview."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys
import json
import re
from datetime import date

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
if not page.robots_noindex:
    problems.append("Preview robots noindex meta missing")
if "X-Robots-Tag: noindex" not in (SITE / "_headers").read_text():
    problems.append("Preview noindex HTTP header missing")
if "Disallow: /" not in (SITE / "robots.txt").read_text():
    problems.append("Preview robots.txt safeguard missing")
html = (SITE / "index.html").read_text(encoding="utf-8")
if "WEBSITE CONCEPT PREVIEW" in html:
    problems.append("Concept-preview banner must be removed")
if "https://masjidbox.com/prayer-times/masjid-at-towfiiq" not in html or 'id="masjidboxTimetable"' not in html:
    problems.append("Live MasjidBox timetable is missing")
if 'id="externalTimetable"' not in html:
    problems.append("Independent iqamah timetable link missing")
# Prayer-times configuration is part of the deployable publication contract.
config_path = SITE / 'data' / 'prayer-config.json'
if not config_path.is_file():
    problems.append('Prayer configuration file missing')
else:
    try:
        conf = json.loads(config_path.read_text(encoding='utf-8'))
        if conf.get('schemaVersion') != 1 or conf.get('timeZone') != 'Europe/London':
            problems.append('Unsupported prayer config schema/time zone')
        calc = conf.get('calculation', {})
        if calc.get('method') not in range(24) or calc.get('school') not in [0, 1]:
            problems.append('Invalid prayer calculation method/school')
        official = conf.get('official', {})
        if not isinstance(official.get('approvedByMasjid'), bool):
            problems.append('Masjid approval flag must be boolean')
        if official.get('approvedByMasjid'):
            date.fromisoformat(official['reviewedAt'])
        if not isinstance(official.get('days'), dict):
            problems.append('Official prayer schedule must be a date-keyed object')
        else:
            starts = {'Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'}
            congregations = starts - {'Sunrise'}
            for iso, entry in official['days'].items():
                d = date.fromisoformat(iso)
                if entry.get('status') != 'approved':
                    problems.append(f'Unapproved date included in official schedule: {iso}')
                if set(entry.get('begins', {})) != starts or set(entry.get('jamaah', {})) != congregations:
                    problems.append(f'Missing/extra prayer keys for {iso}')
                for v in list(entry.get('begins', {}).values()) + list(entry.get('jamaah', {}).values()):
                    if not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d', str(v)):
                        problems.append(f'Invalid time format for {iso}: {v}')
                if 'jumuah' in entry:
                    if d.weekday() != 4 or not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d', str(entry['jumuah'])):
                        problems.append(f'Invalid Jumuah time/date: {iso}')
    except (ValueError, KeyError, TypeError, AttributeError, json.JSONDecodeError) as exc:
        problems.append(f'Prayer config invalid: {exc}')
if "frame-src https://masjidbox.com" not in (SITE / "_headers").read_text(encoding="utf-8"):
    problems.append("MasjidBox missing from frame-src policy")
if 'prayer-times.js' in html or 'api.aladhan.com' in html:
    problems.append("Legacy calculated prayer timetable still loaded")
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
        if "main" in wrangler:
            problems.append("No Worker entrypoint is needed for this static-only preview")
        if "routes" in wrangler or "route" in wrangler:
            problems.append("Routes should remain managed in the Cloudflare dashboard")
        if wrangler.get("workers_dev") is not False:
            problems.append("workers_dev should remain false for dashboard-managed routes")
    except (ValueError, TypeError, AttributeError) as exc:
        problems.append(f"Invalid Wrangler configuration: {exc}")
if problems:
    print("FAILED:\n" + "\n".join(f" - {p}" for p in problems))
    sys.exit(1)
print(f"PASS: {len(page.ids)} IDs, {len(page.id_refs)} anchors, {len(page.files)} local assets; preview safeguards present.")
