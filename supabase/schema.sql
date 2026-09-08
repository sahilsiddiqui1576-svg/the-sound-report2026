create extension if not exists "pgcrypto";

-- ============================================================
-- THE SOUND REPORT
-- Editorial CMS + Music Intelligence data model
-- ============================================================

-- -----------------------------
-- Editorial content
-- -----------------------------
create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  title text not null,
  slug text not null,
  publish_date timestamptz not null default now(),
  updated_date timestamptz,
  featured boolean not null default false,
  draft boolean not null default false,
  category text not null default '',
  tags text[] not null default '{}',
  genre text[] not null default '{}',
  mood text[] not null default '{}',
  language text[] not null default '{}',
  month text,
  year integer,
  cover_image text not null default '',
  cover_image_alt text,
  excerpt text not null default '',
  author text,
  display_order integer,
  artist_name text,
  artist_image text,
  location text,
  country text,
  artist_links jsonb not null default '{}'::jsonb,
  curator text,
  spotify_url text,
  apple_music_url text,
  youtube_url text,
  week_label text,
  research_notes text,
  tracks jsonb not null default '[]'::jsonb,
  body text not null default '',
  seo_title text,
  seo_description text,
  seo_image text,
  canonical_url text,
  created_at timestamptz not null default now(),
  constraint content_entries_collection_check check (collection in ('articles','monthly-reviews','weekly-picks','playlists','artist-spotlights','trend-reports','industry-insights')),
  constraint content_entries_collection_slug_unique unique (collection, slug)
);

-- -----------------------------
-- Core music entities
-- -----------------------------
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_name text,
  image_url text,
  bio text,
  country text default 'India',
  primary_city text,
  languages text[] not null default '{}',
  genres text[] not null default '{}',
  labels text[] not null default '{}',
  spotify_url text,
  apple_music_url text,
  amazon_music_url text,
  youtube_url text,
  instagram_url text,
  website_url text,
  is_independent boolean not null default false,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  artist_id uuid references public.artists(id) on delete set null,
  album_title text,
  release_date date,
  language text,
  region text,
  genre text,
  label text,
  isrc text,
  cover_image_url text,
  spotify_url text,
  apple_music_url text,
  amazon_music_url text,
  youtube_url text,
  explicit boolean not null default false,
  is_active boolean not null default true,
  editorial_note text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists songs_artist_id_idx on public.songs(artist_id);
create index if not exists songs_release_date_idx on public.songs(release_date desc);
create index if not exists songs_language_idx on public.songs(language);
create index if not exists songs_region_idx on public.songs(region);

-- Multiple artists can be credited on one song.
create table if not exists public.song_artists (
  song_id uuid not null references public.songs(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  role text not null default 'primary',
  display_order integer not null default 0,
  primary key (song_id, artist_id, role)
);

-- -----------------------------
-- Platform catalogue
-- -----------------------------
create table if not exists public.platforms (
  id smallserial primary key,
  slug text not null unique,
  name text not null unique,
  is_active boolean not null default true
);

insert into public.platforms (slug, name) values
  ('spotify', 'Spotify'),
  ('apple-music', 'Apple Music'),
  ('amazon-music', 'Amazon Music'),
  ('youtube', 'YouTube')
on conflict (slug) do nothing;

-- A snapshot represents one collection event from a platform.
-- Example: Spotify India Top 50 captured on 2026-09-08.
create table if not exists public.chart_snapshots (
  id uuid primary key default gen_random_uuid(),
  platform_id smallint not null references public.platforms(id),
  chart_name text not null,
  chart_slug text not null,
  country text not null default 'IN',
  region text,
  language text,
  captured_at timestamptz not null default now(),
  chart_date date not null default current_date,
  source_url text,
  source_type text not null default 'official',
  ingestion_status text not null default 'verified',
  metadata jsonb not null default '{}'::jsonb,
  unique (platform_id, chart_slug, country, region, language, chart_date)
);

create index if not exists chart_snapshots_date_idx on public.chart_snapshots(chart_date desc);
create index if not exists chart_snapshots_platform_idx on public.chart_snapshots(platform_id, chart_date desc);

-- Individual ranked chart positions.
create table if not exists public.chart_entries (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.chart_snapshots(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position integer not null check (position > 0),
  previous_position integer,
  peak_position integer,
  weeks_on_chart integer,
  rank_change integer,
  source_song_id text,
  source_artist_name text,
  source_title text,
  metadata jsonb not null default '{}'::jsonb,
  unique (snapshot_id, song_id),
  unique (snapshot_id, position)
);

create index if not exists chart_entries_song_idx on public.chart_entries(song_id);
create index if not exists chart_entries_rank_idx on public.chart_entries(snapshot_id, position);

-- -----------------------------
-- Raw platform metrics
-- -----------------------------
-- One row per song/platform/date. Keep raw measurements separate from
-- derived TSR scores so scoring can be recalculated later.
create table if not exists public.song_platform_metrics (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  platform_id smallint not null references public.platforms(id),
  metric_date date not null,
  chart_position integer,
  streams bigint,
  views bigint,
  likes bigint,
  playlist_reach bigint,
  saves bigint,
  followers_gained bigint,
  daily_streams bigint,
  daily_views bigint,
  seven_day_streams bigint,
  seven_day_views bigint,
  velocity numeric(12,4),
  source_url text,
  source_type text not null default 'official',
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (song_id, platform_id, metric_date)
);

create index if not exists song_metrics_date_idx on public.song_platform_metrics(metric_date desc);
create index if not exists song_metrics_song_date_idx on public.song_platform_metrics(song_id, metric_date desc);
create index if not exists song_metrics_platform_date_idx on public.song_platform_metrics(platform_id, metric_date desc);

create table if not exists public.artist_platform_metrics (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  platform_id smallint not null references public.platforms(id),
  metric_date date not null,
  followers bigint,
  monthly_listeners bigint,
  streams bigint,
  views bigint,
  subscribers bigint,
  playlist_reach bigint,
  charted_songs integer,
  velocity numeric(12,4),
  source_url text,
  source_type text not null default 'official',
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (artist_id, platform_id, metric_date)
);

create index if not exists artist_metrics_date_idx on public.artist_platform_metrics(metric_date desc);
create index if not exists artist_metrics_artist_date_idx on public.artist_platform_metrics(artist_id, metric_date desc);

-- -----------------------------
-- TSR derived intelligence
-- -----------------------------
create table if not exists public.song_scores (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  score_date date not null,
  tsr_score numeric(6,2) not null check (tsr_score >= 0 and tsr_score <= 100),
  platform_strength numeric(6,2),
  cross_platform_strength numeric(6,2),
  momentum_score numeric(6,2),
  youtube_score numeric(6,2),
  regional_score numeric(6,2),
  longevity_score numeric(6,2),
  confidence numeric(6,2),
  rank integer,
  previous_rank integer,
  rank_change integer,
  methodology_version text not null default 'v1',
  component_data jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  unique (song_id, score_date, methodology_version)
);

create index if not exists song_scores_date_rank_idx on public.song_scores(score_date desc, rank asc);
create index if not exists song_scores_song_date_idx on public.song_scores(song_id, score_date desc);

create table if not exists public.artist_scores (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  score_date date not null,
  tsr_score numeric(6,2) not null check (tsr_score >= 0 and tsr_score <= 100),
  momentum_score numeric(6,2),
  cross_platform_strength numeric(6,2),
  regional_strength numeric(6,2),
  export_strength numeric(6,2),
  release_activity_score numeric(6,2),
  confidence numeric(6,2),
  rank integer,
  previous_rank integer,
  rank_change integer,
  methodology_version text not null default 'v1',
  component_data jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  unique (artist_id, score_date, methodology_version)
);

create index if not exists artist_scores_date_rank_idx on public.artist_scores(score_date desc, rank asc);
create index if not exists artist_scores_artist_date_idx on public.artist_scores(artist_id, score_date desc);

-- -----------------------------
-- Regions, genres and trend signals
-- -----------------------------
create table if not exists public.regions (
  id smallserial primary key,
  slug text not null unique,
  name text not null unique,
  country text not null default 'IN',
  languages text[] not null default '{}',
  is_active boolean not null default true
);

insert into public.regions (slug, name, languages) values
  ('india', 'India', '{Hindi,English}'),
  ('north-india', 'North India', '{Hindi,Punjabi,Haryanvi}'),
  ('south-india', 'South India', '{Tamil,Telugu,Malayalam,Kannada}'),
  ('west-india', 'West India', '{Marathi,Gujarati,Hindi}'),
  ('east-india', 'East India', '{Bengali,Odia,Assamese}')
on conflict (slug) do nothing;

create table if not exists public.trend_signals (
  id uuid primary key default gen_random_uuid(),
  signal_date date not null,
  name text not null,
  slug text not null,
  category text not null,
  description text,
  region text,
  language text,
  score numeric(6,2),
  change_percent numeric(10,2),
  direction text,
  evidence jsonb not null default '{}'::jsonb,
  source_urls text[] not null default '{}',
  confidence numeric(6,2),
  created_at timestamptz not null default now(),
  unique (slug, signal_date)
);

create index if not exists trend_signals_date_idx on public.trend_signals(signal_date desc);
create index if not exists trend_signals_category_idx on public.trend_signals(category, signal_date desc);

-- -----------------------------
-- Data provenance / ingestion
-- -----------------------------
create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  platform_id smallint references public.platforms(id),
  name text not null,
  source_url text,
  source_type text not null default 'official',
  publisher text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.data_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.data_sources(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running',
  rows_read integer not null default 0,
  rows_written integer not null default 0,
  error_count integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

-- -----------------------------
-- Site configuration
-- -----------------------------
create table if not exists public.site_settings (
  id boolean primary key default true,
  site_name text not null default 'The Sound Report',
  tagline text not null default 'Music. Culture. The Business of Sound.',
  founder_name text not null default '',
  default_seo_description text not null default '',
  default_seo_image text not null default '/images/hero-crowd.jpg',
  socials jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_settings (
  id boolean primary key default true,
  hero_entry_id uuid references public.content_entries(id) on delete set null,
  featured_entry_ids uuid[] not null default '{}',
  featured_artist_id uuid references public.content_entries(id) on delete set null,
  featured_playlist_id uuid references public.content_entries(id) on delete set null,
  weekly_pick_id uuid references public.content_entries(id) on delete set null,
  monthly_review_id uuid references public.content_entries(id) on delete set null,
  trend_report_id uuid references public.content_entries(id) on delete set null,
  industry_insight_id uuid references public.content_entries(id) on delete set null,
  newsletter_heading text,
  newsletter_body text,
  updated_at timestamptz not null default now()
);

-- -----------------------------
-- RLS
-- -----------------------------
alter table public.content_entries enable row level security;
alter table public.artists enable row level security;
alter table public.songs enable row level security;
alter table public.song_artists enable row level security;
alter table public.platforms enable row level security;
alter table public.chart_snapshots enable row level security;
alter table public.chart_entries enable row level security;
alter table public.song_platform_metrics enable row level security;
alter table public.artist_platform_metrics enable row level security;
alter table public.song_scores enable row level security;
alter table public.artist_scores enable row level security;
alter table public.regions enable row level security;
alter table public.trend_signals enable row level security;
alter table public.data_sources enable row level security;
alter table public.data_ingestion_runs enable row level security;
alter table public.site_settings enable row level security;
alter table public.homepage_settings enable row level security;

-- Public read access is limited to published/public intelligence data.
create policy "Published content is public" on public.content_entries
for select using (draft = false);
create policy "Music artists are public" on public.artists
for select using (is_active = true);
create policy "Music songs are public" on public.songs
for select using (is_active = true);
create policy "Song artist credits are public" on public.song_artists
for select using (true);
create policy "Platforms are public" on public.platforms
for select using (is_active = true);
create policy "Chart snapshots are public" on public.chart_snapshots
for select using (ingestion_status = 'verified');
create policy "Chart entries are public" on public.chart_entries
for select using (exists (select 1 from public.chart_snapshots s where s.id = snapshot_id and s.ingestion_status = 'verified'));
create policy "Song metrics are public" on public.song_platform_metrics
for select using (true);
create policy "Artist metrics are public" on public.artist_platform_metrics
for select using (true);
create policy "Song scores are public" on public.song_scores
for select using (true);
create policy "Artist scores are public" on public.artist_scores
for select using (true);
create policy "Regions are public" on public.regions
for select using (is_active = true);
create policy "Trend signals are public" on public.trend_signals
for select using (confidence is null or confidence >= 60);
create policy "Site settings are public" on public.site_settings
for select using (true);
create policy "Homepage settings are public" on public.homepage_settings
for select using (true);

-- Authenticated editorial/admin access.
create policy "Authenticated users manage content" on public.content_entries
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage artists" on public.artists
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage songs" on public.songs
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage song credits" on public.song_artists
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage charts" on public.chart_snapshots
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage chart entries" on public.chart_entries
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage song metrics" on public.song_platform_metrics
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage artist metrics" on public.artist_platform_metrics
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage song scores" on public.song_scores
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage artist scores" on public.artist_scores
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage regions" on public.regions
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage trends" on public.trend_signals
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage data sources" on public.data_sources
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage ingestion runs" on public.data_ingestion_runs
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage site settings" on public.site_settings
for all to authenticated using (true) with check (true);
create policy "Authenticated users manage homepage settings" on public.homepage_settings
for all to authenticated using (true) with check (true);

-- -----------------------------
-- Storage
-- -----------------------------
insert into public.site_settings (id)
values (true)
on conflict (id) do nothing;

insert into public.homepage_settings (id)
values (true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "Public can view site images" on storage.objects
for select using (bucket_id = 'site-images');
create policy "Authenticated users can upload site images" on storage.objects
for insert to authenticated with check (bucket_id = 'site-images');
create policy "Authenticated users can update site images" on storage.objects
for update to authenticated using (bucket_id = 'site-images') with check (bucket_id = 'site-images');
create policy "Authenticated users can delete site images" on storage.objects
for delete to authenticated using (bucket_id = 'site-images');
