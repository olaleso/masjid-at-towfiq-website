# GitHub + Cloudflare Pages — one-time setup

## 1. Create a separate GitHub repository

Authenticated GitHub owner: `olaleso`.

- Open https://github.com/new
- Repository name: `masjid-at-towfiq-website`
- Visibility: **Private** is appropriate during development (Cloudflare connection may require granting the GitHub app repository access). If public, preview content remains accessible; the site's noindex directives only discourage search indexing, not public viewing.
- Choose **empty repository** (no auto-generated README, licence or .gitignore; these are in the package).

The **ready-to-push ZIP** includes `.git/` and a local initial commit. Extract the entire ZIP, open PowerShell within `masjid-at-towfiq-website`, then push. Alternatively clone the supplied `.bundle` via `git clone .\Masjid_At_Towfiq_Initial_Commit.bundle masjid-at-towfiq-website`. The source-only ZIP has no `.git` metadata and must be initialised separately.

Push the prepared `main` history:

```powershell
git remote set-url origin https://github.com/olaleso/masjid-at-towfiq-website.git
git push -u origin main
```

If `origin` has already been set in the supplied `.bundle` clone or repository, use `git remote set-url origin https://github.com/olaleso/masjid-at-towfiq-website.git` before pushing.

## 2. Connect to Cloudflare Pages (recommended)

- In your **correct Cloudflare account**, go to **Workers & Pages → Create → Pages → Connect to Git** (the exact dashboard labels may vary).
- Select GitHub account **olaleso**, authorize only the masjid repository as needed, and choose `masjid-at-towfiq-website`.
- Project name: `masjid-at-towfiq` (Cloudflare may require a unique variant).
- Production branch: `main`.
- Framework preset: `None`.
- **Build command: leave empty.**
- **Build output directory: `public`** (no initial slash).
- Root directory: leave blank (repository root).
- Save and deploy; Cloudflare will show the actual `*.pages.dev` URL when deployment succeeds.

Each subsequent push to `main` will deploy automatically. Pull requests/other branches can produce previews without replacing the production branch. **Do not map the main masjid domain or remove pre-launch safeguards until verified.**

## 3. For future work

```powershell
git add .
git commit -m "Update masjid website content"
git push origin main
```

For major changes, create a feature branch and merge an approved pull request after checking the Cloudflare preview.

## Alternative: upload from a computer (not preferred)

Cloudflare Direct Upload and Git Integration have different project setup paths and cannot simply be switched later. If automatic GitHub deployments are your goal, choose Git Integration from the outset.

## Troubleshooting

- **Blank page:** confirm Cloudflare's output directory is `public`.
- **Logo not loading:** check `public/assets/at-towfiq-logo.png` is committed.
- **Photograph missing:** the concept presently uses an externally hosted Unsplash photo; replace with locally stored masjid-authorized photography.
- **Link to the Madrasah opens a modal:** expected until its separate domain is confirmed.
- **No real payments:** expected for the preview.
