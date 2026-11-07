# New masjid exterior photos — 7 November 2026

Four authentic exterior photographs supplied by the masjid team replace the previous low-resolution property image in the **Our new masjid project** section.

## Image package
Download **At-Towfiq-New-Masjid-4-Photos.zip** from the corresponding ChatGPT conversation.

After extracting to the root of `C:\App\masjid-at-towfiq-website`, the following files must exist:

- `public/assets/new-masjid-2026-front.webp`
- `public/assets/new-masjid-2026-elevation.webp`
- `public/assets/new-masjid-2026-side.webp`
- `public/assets/new-masjid-2026-corner.webp`

The images are WebP exports of the **real provided photographs**, retained at 1140×1520 each, with no AI edits or new signage.

## Publish
```powershell
cd C:\App\masjid-at-towfiq-website
git pull origin main

# Extract the downloaded ZIP into this repository root using PowerShell:
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\At-Towfiq-New-Masjid-4-Photos.zip" -DestinationPath . -Force

# Commit only the four new photo assets.
git add public/assets/new-masjid-2026-*.webp
git commit -m "Add real November 2026 new masjid property photos"
git push origin main

npx wrangler@latest deploy
```

The new project viewer preloads all four real images and shows them in a responsive mosaic. Clicking or keyboard-activating an image opens an accessible native dialog with previous/next arrows. The original image remains visible if any of the four assets is missing; no broken image tiles appear.

## Safety
- The photos are of the newly secured property on Temperance Street, **not** the current operating prayer address.
- Preserve the existing directions and donation details until the charity publishes a move announcement.
- No photographic alterations that create synthetic branding or imply the building is already converted for use.
- The previous low-resolution asset is retained as a safe fallback.

## Rollback
Revert the companion website feature merge commit and redeploy. The original project image remains in the repository. The four WebP files can remain safely unused or be removed in a separate commit; they contain no private learner information.
