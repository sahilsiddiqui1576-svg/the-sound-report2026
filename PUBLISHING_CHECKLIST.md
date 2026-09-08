# The Sound Report: publishing checklist

## 1. Supabase
1. Create or open the production Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. Run `supabase/launch.sql`.
4. Confirm the public read policies exist.
5. Confirm the `site-images` storage bucket exists and is public for published assets.

## 2. Vercel environment
Set these production variables in the Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Set `NEXT_PUBLIC_SITE_URL` to the final production domain, not a preview URL.

Do not expose a Supabase service-role key to the browser. If a future ingestion worker needs elevated database access, keep its service-role credential server-side only.

## 3. Data before launch
The site is deliberately data-honest. Empty database states are shown as empty states instead of invented rankings.

Before announcing the site, populate:

- `artists`
- `songs`
- `song_artists` for multi-artist credits
- `chart_snapshots`
- `chart_entries`
- `song_platform_metrics`
- `artist_platform_metrics`
- `song_scores`
- `artist_scores`
- `trend_signals`

Every chart/metric record should retain its source URL, source type and capture date. Scores should be calculated from raw signals and written with a methodology version.

## 4. Required launch checks
Open these routes on the production domain:

- `/`
- `/songs`
- `/artists`
- `/charts`
- `/trends`
- `/reports`
- `/journal`
- `/playlists`
- `/search`
- `/about`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`
- `/api/health`

The health endpoint should return `ok: true` and `databaseConfigured: true` in production.

## 5. SEO and sharing
- Confirm the final site URL is set.
- Confirm title and description appear correctly in page source.
- Confirm Open Graph image exists at the configured path.
- Submit `/sitemap.xml` to Google Search Console after the final domain is live.
- Verify the favicon is present.

## 6. Editorial QA
- Remove or mark any draft content that is not publication-ready.
- Check every external streaming link.
- Check artist names, song titles, language and region labels.
- Check every statistic against its source.
- Do not publish a TSR score unless its underlying signals and methodology are available.

## 7. Branch / deployment
The finished work is being built on `rebuild-v2`. Keep `main` untouched until the production preview has passed the checks above. Then merge `rebuild-v2` into `main` and deploy the production branch.

## Important limitation
The codebase can be made publication-ready here, but the final Supabase production data import and Vercel production environment values must be supplied in the user's connected accounts. This repository contains the schema, query layer, publishing routes and launch configuration needed for that final step.
