# The Sound Report

An independent, editorial music publication — reviews, weekly picks, playlists,
artist spotlights, trend reports, industry insights, and general articles.
Built with **Next.js 15**, **React**, **TypeScript**, **Tailwind CSS**, and
**Framer Motion**. Content lives entirely as **Markdown files in Git** — there
is no CMS, no admin panel, and no database.

Founded and edited by **Sahil Siddiqui**.

> **Editorial policy:** this site never streams or hosts copyrighted audio. Every
> track reference links out to official services (Spotify, Apple Music, Amazon
> Music, YouTube). See `src/components/StreamingLinks.tsx`.

---

## 1. Architecture

```
Next.js  →  Markdown/content files  →  GitHub  →  Vercel
```

Content is authored by editing Markdown files directly (in your code editor,
or in GitHub's web UI). Pushing to `main` triggers an automatic Vercel build
and deploy. There is no separate content service to configure, no login
screen to manage, and nothing beyond this repository to keep in sync.

| Layer      | Choice |
|------------|--------|
| Framework  | Next.js 15 (App Router, static generation) |
| Language   | TypeScript |
| Styling    | Tailwind CSS |
| Animation  | Framer Motion |
| Content    | Markdown files in `/content`, parsed with `gray-matter` |
| Search     | Client-side full-text search via `fuse.js` over a build-time JSON index |
| Hosting    | Vercel (free tier) |
| Code host  | GitHub (free, public or private repo) |

---

## 2. Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The site reads content directly from
`/content` (see `src/lib/content.ts`) — edit a Markdown file, save it, and
refresh the page to see the change.

---

## 3. Content model

Every entry is a Markdown file with YAML frontmatter, parsed by `gray-matter`.
The full frontmatter shape (which fields exist, which are required) is
defined once in `src/lib/types.ts` (`BaseFrontmatter`), and the list of
collections and their folders is defined in `COLLECTIONS` in that same file.

### Collections

| Collection | Folder |
|---|---|
| Articles | `content/articles/` |
| Artist Spotlights | `content/artist-spotlights/` |
| Playlists | `content/playlists/` |
| Monthly Reviews | `content/monthly-reviews/` |
| Weekly Picks | `content/weekly-picks/` |
| Trend Reports | `content/trend-reports/` |
| Industry Insights | `content/industry-insights/` |

### Singleton content files

| Page | File |
|---|---|
| Homepage sections config | `content/settings/homepage.md` |
| About page | `content/pages/about.md` |
| Contact page | `content/pages/contact.md` |
| Site-wide settings (name, tagline, socials) | `content/settings/site.md` |

### Images

Images live in `public/images/` (e.g. `public/images/covers/`,
`public/images/artists/`) and are referenced from frontmatter as an
absolute path, e.g. `"/images/covers/my-cover.jpg"`. To add a new image,
drop the file into the appropriate `public/images/` folder and reference
that path in the Markdown frontmatter — no upload step or media manager is
involved.

---

## 4. Adding a new article

1. Pick the right folder for the content type (see the table above) — for a
   general article, that's `content/articles/`.
2. Create a new `.md` file. The filename becomes part of the URL, so use a
   short, URL-safe slug, e.g. `content/articles/my-new-article.md`.
3. Add YAML frontmatter and a Markdown body, following the shape of an
   existing file in the same folder. At minimum:

   ```md
   ---
   title: "My New Article"
   slug: "my-new-article"
   publishDate: 2026-09-05T09:00:00.000Z
   featured: false
   draft: false
   category: "Music"
   tags: ["music"]
   coverImage: "/images/covers/my-new-article.jpg"
   excerpt: "One or two sentences summarizing the piece."
   author: "The Sound Report Editors"
   seoTitle: "My New Article — The Sound Report"
   seoDescription: "One or two sentences summarizing the piece."
   ---
   Your article body goes here, written in Markdown.

   ## A subheading works too.
   ```

   The `slug` field should match the filename (minus `.md`). Set `draft:
   true` to keep a piece hidden from production while you're still writing it
   — draft entries only render when running `npm run dev` locally.
4. Add the cover image referenced above to `public/images/covers/` (or
   wherever you pointed `coverImage`).
5. Save, commit, and push (see §6). No build step is required locally to see
   the new article on your own machine — just run `npm run dev` and visit the
   collection page.

Some collection types support extra fields (e.g. `tracks` for Monthly
Reviews/Weekly Picks/Playlists, `artistName`/`artistLinks` for Artist
Spotlights, `genre`/`mood`/`language` for filtering). Check `BaseFrontmatter`
in `src/lib/types.ts` or an existing file in the same folder for the full set
of fields that collection uses.

---

## 5. Editing an existing article

1. Open the relevant `.md` file directly, e.g.
   `content/artist-spotlights/hanumankind.md`.
2. Edit the frontmatter fields and/or the Markdown body text below the `---`
   fence.
3. Save, commit, and push (see §6).

To unpublish something without deleting it, set `draft: true` in its
frontmatter — it stays in the repo but is excluded from the production
build. To feature it on the homepage, set `featured: true` and/or reference
it from `content/settings/homepage.md`.

---

## 6. Pushing changes to GitHub and deploying to Vercel

```bash
git add .
git commit -m "Add/update article: <short description>"
git push origin main
```

That's it. Vercel is connected to this GitHub repository and is configured to
auto-deploy every push to `main` (or every merged pull request). Once the
push lands:

1. Vercel detects the new commit and starts a build automatically —
   no manual trigger needed.
2. The build runs `npm run build`, which regenerates
   `public/search-index.json` from the current content and then runs
   `next build`.
3. On success, Vercel promotes the new build to production automatically.

You can watch build progress and logs from the Vercel dashboard → your
project → **Deployments**. If you want to preview a change before merging to
`main`, push to a branch or open a pull request — Vercel will build a
preview deployment with its own URL automatically.

### Environment variables

Copy `.env.example` to `.env.local` for local development (optional — the
site works without any env vars set). In Vercel → your project →
**Settings → Environment Variables**, set:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your production URL, used for SEO metadata, sitemap.xml, and robots.txt |

Optional (leave unset to keep forms in "no-op confirmation" mode):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` | A free Buttondown/Formspree endpoint |
| `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` | A free Formspree endpoint |

---

## 7. Adding a new content type or field

1. Add the field to `BaseFrontmatter` in `src/lib/types.ts` (or, for a whole
   new collection, add an entry to `COLLECTIONS` in that same file and create
   its content folder under `content/`).
2. If it's a brand-new collection, add it to `LIST_STYLE` in
   `src/app/[collection]/page.tsx` (`"grid"` or `"list"`) and, if it should
   appear in primary navigation, to `NAV` in `src/components/Header.tsx`.
3. Use the new field in your Markdown frontmatter and reference it from
   components wherever `frontmatter.*` is read.

---

## 8. Search & filtering

`npm run build` automatically runs the `prebuild` script, which executes
`scripts/build-search-index.ts`, which flattens every collection into
`public/search-index.json`. The `/search` page fetches this file client-side
and runs fuzzy search with `fuse.js`, plus dropdown filters for genre, mood,
and language. Collection listing pages filter server-side via URL query
params using `FilterBar.tsx`.

To regenerate the search index without a full build, run:

```bash
npm run index-search
```

---

## 9. Accessibility & SEO notes

Skip-to-content link, visible focus rings, full `<title>`/meta
description/Open Graph/Twitter card coverage per route, JSON-LD on article
pages, generated `sitemap.ts`/`robots.ts`, and `next/image` throughout.

---

## 10. Costs

| Service | Tier used | Cost |
|---|---|---|
| GitHub | Free (public/private repo) | $0 |
| Vercel | Hobby | $0 |
| Fonts (Google Fonts via next/font) | Self-hosted at build time | $0 |

No CMS seat licenses, no third-party auth provider, and no database — content
and media both live in this GitHub repository.
