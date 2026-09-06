create extension if not exists "pgcrypto";

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

alter table public.content_entries enable row level security;
alter table public.site_settings enable row level security;
alter table public.homepage_settings enable row level security;

create policy "Published content is public" on public.content_entries
for select using (draft = false);

create policy "Site settings are public" on public.site_settings
for select using (true);

create policy "Homepage settings are public" on public.homepage_settings
for select using (true);

create policy "Authenticated users manage content" on public.content_entries
for all to authenticated using (true) with check (true);

create policy "Authenticated users manage site settings" on public.site_settings
for all to authenticated using (true) with check (true);

create policy "Authenticated users manage homepage settings" on public.homepage_settings
for all to authenticated using (true) with check (true);

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
