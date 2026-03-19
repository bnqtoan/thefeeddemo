# The Feed — Setup Guide

## Prerequisites
- Node.js 22+
- Cloudflare account (free tier works)
- GitHub repo for content

## Quick Start

1. Clone this repo
2. `cd website && npm install`
3. Copy `.env.example` and fill in your values
4. `npm run dev` to start locally

## Configuration

### Site Branding
Edit these files to customize your site:
- `src/i18n/en.json` — Site name, tagline, UI strings
- `src/i18n/vi.json` — Vietnamese translations (optional)
- `astro.config.mjs` — Site URL, PWA manifest
- `src/layouts/BaseLayout.astro` — Analytics, footer
- `src/pages/api/og.png.ts` — OG image branding
- `src/pages/about/index.astro` — About page content

### Cloudflare Pages
1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output: `dist`
4. Add custom domain in Cloudflare dashboard

### Environment Variables
- `EDITION` — "global" (default) or custom edition name
- `CLOUDFLARE_ACCOUNT_ID` — Your Cloudflare account
- `CLOUDFLARE_API_TOKEN` — API token with Pages permission

### Content Collections
- `posts/` — Articles, videos, audio, galleries, quotes
- `stream/` — AI-powered link recaps
- `stream-content/` — Full fetched content from stream URLs
- `jokes/` — Dad jokes with optional images
- `tools/` — Tool recommendations (JSON)

## GitHub Actions

Three workflows automate the content pipeline. They require a `draft` branch.

### Initial Setup

```bash
# Create draft branch (once)
git checkout -b draft
git push origin draft
```

### Required GitHub Secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `CF_API_TOKEN` | Yes | Cloudflare API token (Pages deploy) |
| `CF_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `INGEST_URL` | No | Ingest worker URL + `/ingest` (for image processing) |
| `INGEST_SECRET` | No | Shared secret for ingest worker auth |
| `MEDIA_BASE_URL` | No | R2 media CDN URL (to skip already-uploaded images) |
| `TELEGRAM_TOKEN` | No | Telegram bot token (deploy notifications) |
| `TELEGRAM_CHAT_ID` | No | Telegram chat ID (deploy notifications) |

### Required GitHub Repo Settings

- Settings → Actions → General → Workflow permissions → **Read and write permissions**
- Settings → Actions → General → **Allow GitHub Actions to create and approve pull requests**

### Workflows

#### `deploy.yml` — Build & Deploy
- **Trigger:** push to `main`, or manual dispatch
- **What:** Detects content-only vs code changes, builds Astro, deploys via Wrangler
- **Cache:** Astro build cache keyed by content hash (no stale fallback — prevents 404s)
- **Optional:** Telegram notification (uncomment in workflow file)

#### `process-drafts.yml` — Draft Content Pipeline
- **Trigger:** push to `draft` branch (content files only)
- **What:** Processes draft posts (uploads external hero images via ingest worker), creates PR from `draft` → `main`, auto-merges
- **Skip:** If `INGEST_URL` not set, skips image processing (just creates PR)

#### `sync-draft.yml` — Keep Draft Synced
- **Trigger:** push to `main`
- **What:** After main updates, syncs `draft` to include main's changes
- **Logic:** If draft has unmerged commits (new ingest content), rebases. If even/behind, force-resets to main.

### Content Pipeline Flow

```
Telegram Bot → Ingest Worker → push to draft branch
                                     ↓
                          process-drafts.yml
                          (image upload + PR + auto-merge)
                                     ↓
                               push to main
                                     ↓
                    ┌────────────────┼────────────────┐
                    ↓                                 ↓
              deploy.yml                       sync-draft.yml
           (build + deploy)               (rebase draft onto main)
```

## Ingest Worker
See the separate [ingest repo](../ingest) for the Telegram bot + content pipeline setup.