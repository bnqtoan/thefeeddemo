# The Feed — Customization Guide

Guide for AI coding agents to customize this Astro 5 website template.

## Architecture Overview

```
src/
├── content/           # Content collections (MDX/JSON/MD)
│   ├── config.ts      # Collection schemas (Zod)
│   ├── posts/         # Articles, videos, audio, galleries, quotes (.mdx)
│   ├── stream/        # AI link recaps (.mdx)
│   ├── stream-content/# Full fetched content (.md)
│   ├── jokes/         # Dad jokes (.md)
│   └── tools/         # Tool recommendations (.json)
├── pages/             # File-based routing
│   ├── index.astro    # Homepage
│   ├── feed/          # Posts feed with filters
│   ├── stream/        # Stream feed with infinite scroll
│   ├── jokes/         # Jokes page
│   ├── about/         # About page
│   ├── api/           # API endpoints (search, OG image, feed, stream)
│   ├── [...slug].astro       # Post detail (catch-all)
│   ├── [...slug].md.ts       # Post as markdown (for AI agents)
│   ├── 404.astro      # 404 page
│   └── rss.xml.ts     # RSS feed
├── components/
│   ├── feed/          # FeedCard variants (Article, Audio, Video, Gallery, Quote, Playlist)
│   ├── stream/        # StreamCard, StreamBox, StreamModal
│   ├── ShareButton.astro
│   ├── ShareImageModal.astro
│   ├── SearchModal.astro
│   ├── GlobalAudioPlayer.astro
│   └── FilterPills.astro
├── layouts/
│   └── BaseLayout.astro  # Main layout (nav, footer, SEO, analytics)
├── styles/
│   └── app.css           # Design tokens + prose styles (Tailwind 4)
├── lib/
│   ├── i18n.ts           # Internationalization (en/vi)
│   ├── data.ts           # Data fetching layer (getPost, getPosts, getStream)
│   └── types.ts          # TypeScript interfaces
└── i18n/
    ├── en.json           # English strings
    └── vi.json           # Vietnamese strings
```

**Rendering:** Astro 5 SSR on Cloudflare Pages. All pages server-rendered. Client JS only for interactives (search modal, audio player, infinite scroll).

**Styling:** Tailwind CSS v4 with `@theme` design tokens in `src/styles/app.css`. No tailwind.config file — config is in CSS.

## Design Token System

All colors, fonts, and spacing are defined as CSS custom properties in `src/styles/app.css` under `@theme {}`:

```css
@theme {
  /* Typography */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-heading: 'Lora', Georgia, serif;

  /* Colors */
  --color-ink: #1a1a1a;       /* Primary text */
  --color-soft: #666;          /* Secondary text */
  --color-faint: #aaa;         /* Tertiary text */
  --color-bg: #fafaf8;         /* Page background */
  --color-card: #fff;          /* Card background */
  --color-border: #e8e8e5;     /* Borders */
  --color-border-light: #f3f3f0; /* Light borders */

  /* Accent (brand color) */
  --color-accent: #1d4ed8;     /* Primary accent (blue) */
  --color-accent-soft: #eff6ff; /* Light accent bg */
  --color-accent-mid: #bfdbfe;  /* Medium accent */

  /* Status */
  --color-green: #1a7f5a;
  --color-amber: #a16207;
  --color-red: #be123c;
}
```

### How to Change Colors

Edit `src/styles/app.css` `@theme` block. Examples:

**Change accent to purple:**
```css
--color-accent: #7c3aed;
--color-accent-soft: #f5f3ff;
--color-accent-mid: #c4b5fd;
```

**Change accent to green:**
```css
--color-accent: #059669;
--color-accent-soft: #ecfdf5;
--color-accent-mid: #a7f3d0;
```

**Dark mode support (not built-in, add if needed):**
```css
@media (prefers-color-scheme: dark) {
  @theme {
    --color-ink: #f5f5f5;
    --color-soft: #a3a3a3;
    --color-bg: #171717;
    --color-card: #262626;
    --color-border: #404040;
  }
}
```

### How to Change Fonts

1. Edit `--font-body` and `--font-heading` in `@theme`
2. Update Google Fonts `<link>` in `src/layouts/BaseLayout.astro` (search for `fonts.googleapis.com`)

**Example: Switch to system fonts only:**
```css
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
Then remove the Google Fonts `<link>` tags in BaseLayout.

## Layout Structure

`src/layouts/BaseLayout.astro` is the single layout. It contains:

```
<html>
  <head>    — SEO meta, OG tags, fonts, analytics placeholder
  <body>
    <nav>   — Site logo + desktop links + mobile hamburger menu
    <main>  — <slot /> (page content)
    <footer>— Site name + footer links
    <!-- Modals: AudioPlayer, ShareImage, StreamModal, Search -->
```

**Max width:** `max-w-3xl` (48rem / 768px) — clean reading layout.

### How to Change Navigation

Edit `BaseLayout.astro`. Desktop nav links are at ~line 99-131, mobile menu at ~line 147-165.

**Add a nav link:**
```astro
<!-- In desktop nav div -->
<a href="/new-page" class="text-soft font-medium hover:text-ink transition-colors">New Page</a>

<!-- In mobile menu div -->
<a href="/new-page" class="mobile-nav-link text-white hover:text-white/80 transition-colors translate-y-4 opacity-0">New Page</a>
```

**Remove a nav link:** Delete the `<a>` tag from both desktop and mobile sections.

### How to Change Footer

Edit `BaseLayout.astro` ~line 172-186. The footer has:
- Left: site name text
- Right: links (currently jokes)

## Adding a New Page

### Simple static page

Create `src/pages/my-page/index.astro`:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
---

<BaseLayout title="My Page" description="Description for SEO">
  <section class="pt-14 pb-10 md:pt-20 md:pb-14">
    <h1 class="text-3xl font-semibold tracking-tight mb-4">My Page</h1>
    <div class="prose-content">
      <p>Your content here. Uses prose-content class for styled markdown-like content.</p>
    </div>
  </section>
</BaseLayout>
```

Then add a nav link in BaseLayout.astro.

### Dynamic page from content collection

1. Add collection in `src/content/config.ts`:
```typescript
const myCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/my-collection' }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        status: z.enum(['draft', 'published']).default('draft'),
    }),
});

// Add to exports
export const collections = { posts, tools, stream, jokes, streamContent, myCollection };
```

2. Create content dir: `src/content/my-collection/`
3. Create page: `src/pages/my-collection/index.astro`
4. Fetch data via `getCollection('myCollection')` from `astro:content`

## Content Collections

### Post Formats

Posts support 7 formats via the `format` field:

| Format | Key Fields | Component |
|--------|-----------|-----------|
| `article` | `heroImage`, body content | FeedCardArticle |
| `short-video` | `videoUrl`, `posterUrl`, `duration`, `aspectRatio` | FeedCardShortVideo |
| `video-embed` | `provider` (youtube/bunny), `videoId` | FeedCardVideoEmbed |
| `audio` | `audioUrl`, `coverImage` | FeedCardAudio |
| `audio-playlist` | `tracks[]` (title, audioUrl, duration) | FeedCardAudioPlaylist |
| `quote` | `quoteText`, `attribution`, `sourceUrl` | FeedCardQuote |
| `gallery` | `images[]` (url, caption) | FeedCardGallery |

### Adding a New Post Format

1. Add format to schema in `config.ts`:
```typescript
format: z.enum(['article', 'short-video', 'video-embed', 'audio', 'audio-playlist', 'quote', 'gallery', 'my-format']),
```

2. Add format-specific fields to the schema

3. Create component `src/components/feed/FeedCardMyFormat.astro`

4. Add case to `FeedCard.astro` (the router component):
```astro
{post.format === "my-format" && <FeedCardMyFormat post={post} />}
```

5. Add TypeScript interface in `src/lib/types.ts`

### Stream Collection

Stream items are AI-generated recaps of external URLs. Schema:
- `type`: "link" (URL recap) or "post" (direct post)
- `title`, `date`, `url`, `source`, `tags`
- Body: markdown recap (TL;DR, takeaways, etc.)

Stream content is created by the ingest worker (Telegram bot), not manually.

## Data Layer

`src/lib/data.ts` provides typed data fetching:

```typescript
// Get all published posts (sorted by date desc)
const posts = await getPosts();

// Get posts by format
const articles = await getPosts('article');
const videos = await getPosts('short-video');

// Get single post by slug
const post = await getPost('my-post-slug');

// Get stream items
const stream = await getStream();

// Get jokes
const jokes = await getJokes();
```

All functions filter by `status: 'published'` automatically.

## i18n System

Two-language support via JSON files: `src/i18n/en.json` and `src/i18n/vi.json`.

**Usage in .astro files:**
```astro
---
import { t } from "../lib/i18n";
---
<h1>{t("site.name")}</h1>
<p>{t("home.subtitle")}</p>
```

**Key sections in en.json:**
```json
{
  "site": { "name", "tagline", "description", "share_brand", "share_url" },
  "nav": { "explore", "search" },
  "home": { "hero", "subtitle", "cta_explore" },
  "explore": { "title", "subtitle", "filter_all" },
  "verification": { ... },
  "stage": { ... }
}
```

**To change language or add one:** Edit `src/lib/i18n.ts`, add new JSON file.

**Edition system:** `EDITION=global` → English, `EDITION=vn` → Vietnamese. Set in env or `wrangler.toml`.

## SEO & Open Graph

### Dynamic OG Images

`src/pages/api/og.png.ts` generates OG images on-the-fly using `workers-og`.

**Usage:** `/api/og.png?title=My+Title&subtitle=Optional&type=article&tags=ai,tools`

**To change OG branding:** Edit the HTML template in `og.png.ts`:
- Brand name (top left)
- Domain (bottom left)
- Colors (gradient, text colors)
- Font

### SEO Meta

Handled in `BaseLayout.astro` via `astro-seo` component. Every page passes `title` and `description` props.

### RSS Feed

`src/pages/rss.xml.ts` — auto-generates from published posts.

### Sitemap

Auto-generated by `@astrojs/sitemap` integration. Custom pages for SSR routes added in `astro.config.mjs`.

## Component Patterns

### Standard Card Component

```astro
---
// src/components/MyCard.astro
interface Props {
  title: string;
  description?: string;
  href: string;
}
const { title, description, href } = Astro.props;
---

<a href={href} class="block p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] hover:border-[var(--color-accent-mid)] transition-colors">
  <h3 class="font-heading font-semibold text-lg text-ink mb-1">{title}</h3>
  {description && <p class="text-sm text-soft leading-relaxed">{description}</p>}
</a>
```

### Styling Conventions

- Use Tailwind utility classes for layout and spacing
- Use CSS variables for colors: `text-[var(--color-soft)]`, `bg-[var(--color-card)]`
- Use `font-heading` for headings, default for body
- Border radius: `rounded-xl` (cards), `rounded-lg` (buttons), `rounded-full` (pills)
- Transitions: `transition-colors` or `transition-opacity`
- Stagger animations: `class="animate-in" style={`--delay: ${index}`}`

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/og.png` | GET | Dynamic OG image generation |
| `/api/search.json` | GET | Search index (JSON) |
| `/api/search` | GET | Search cases/posts |
| `/api/feed` | GET | Paginated post feed |
| `/api/stream` | GET | Paginated stream feed |
| `/api/stream-content/[slug]` | GET | Full stream content |
| `/api/mcp/sse` | GET | MCP server (Server-Sent Events) |
| `/[slug].md` | GET | Post as markdown (AI consumption) |
| `/rss.xml` | GET | RSS feed |

## File Reference: What to Edit for Common Tasks

| Task | File(s) to Edit |
|------|-----------------|
| Change site name/tagline | `src/i18n/en.json` → `site.*` |
| Change colors | `src/styles/app.css` → `@theme` |
| Change fonts | `src/styles/app.css` + `src/layouts/BaseLayout.astro` (Google Fonts link) |
| Change nav links | `src/layouts/BaseLayout.astro` (desktop + mobile nav) |
| Change footer | `src/layouts/BaseLayout.astro` (~line 172) |
| Change homepage | `src/pages/index.astro` |
| Change about page | `src/pages/about/index.astro` |
| Change OG image style | `src/pages/api/og.png.ts` |
| Add analytics | `src/layouts/BaseLayout.astro` (replace analytics comment) |
| Add a new page | Create `src/pages/my-page/index.astro` |
| Add a content collection | `src/content/config.ts` + new dir + new page |
| Add a post format | `config.ts` schema + new FeedCard component + FeedCard.astro router |
| Change post detail layout | `src/pages/[...slug].astro` |
| Change 404 page | `src/pages/404.astro` |

## Deploying Changes

```bash
# Local dev
npm run dev

# Build (check for errors)
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Or push to main branch → GitHub Actions auto-deploys
git add . && git commit -m "customize: update branding" && git push origin main
```

## Content Pipeline (Ingest Worker)

Content flows from Telegram → ingest worker → GitHub → auto-deploy:

```
You send URL in Telegram
  → Ingest worker fetches content (Defuddle / Jina Reader)
  → AI generates recap (Gemini / MiniMax)
  → You preview + approve in Telegram
  → Worker pushes MDX to `draft` branch
  → GitHub Actions: process-drafts.yml creates PR + auto-merges
  → deploy.yml builds + deploys to Cloudflare Pages
```

See `../ingest/SETUP.md` for ingest worker setup.
See `../ingest/AI-CONFIG.md` for AI provider and brand voice configuration.
