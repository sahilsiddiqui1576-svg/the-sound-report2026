-- Launch configuration. Run AFTER schema.sql in Supabase SQL Editor.
-- This file intentionally does not fabricate chart positions, stream counts or scores.
-- Import verified music data separately, then calculate scores from raw metrics.

insert into public.site_settings (id, site_name, tagline, founder_name, default_seo_description, default_seo_image)
values (true, 'The Sound Report', 'India''s Music Pulse', '', 'The Sound Report is India''s music intelligence magazine, tracking songs, artists, charts, trends and the business of sound.', '/images/hero-crowd.jpg')
on conflict (id) do update set
  site_name=excluded.site_name,
  tagline=excluded.tagline,
  default_seo_description=excluded.default_seo_description,
  default_seo_image=excluded.default_seo_image,
  updated_at=now();

insert into public.data_sources (platform_id, name, source_type, publisher, notes)
select p.id, x.name, x.source_type, x.publisher, x.notes
from public.platforms p
join (values
  ('spotify','Spotify India charts','official','Spotify','Use the official Spotify chart pages available for the territory.'),
  ('apple-music','Apple Music India charts','official','Apple Music','Use official India daily and city chart pages.'),
  ('amazon-music','Amazon Music India charts','official','Amazon Music','Use official Amazon Music India chart or popular-song pages.'),
  ('youtube','YouTube music signals','official','YouTube','Use official music-video/channel metrics and only publish metrics that can be verified.')
) as x(slug,name,source_type,publisher,notes) on p.slug=x.slug
where not exists (select 1 from public.data_sources s where s.name=x.name);

-- Useful current-data views. They expose only the latest calculated score per entity.
create or replace view public.current_song_intelligence as
select distinct on (ss.song_id)
  ss.song_id, ss.score_date, ss.tsr_score, ss.platform_strength, ss.cross_platform_strength,
  ss.momentum_score, ss.youtube_score, ss.regional_score, ss.longevity_score,
  ss.confidence, ss.rank, ss.previous_rank, ss.rank_change, ss.methodology_version
from public.song_scores ss
join public.songs s on s.id=ss.song_id and s.is_active=true
order by ss.song_id, ss.score_date desc, ss.calculated_at desc;

create or replace view public.current_artist_intelligence as
select distinct on (ascore.artist_id)
  ascore.artist_id, ascore.score_date, ascore.tsr_score, ascore.momentum_score,
  ascore.cross_platform_strength, ascore.regional_strength, ascore.export_strength,
  ascore.release_activity_score, ascore.confidence, ascore.rank, ascore.previous_rank,
  ascore.rank_change, ascore.methodology_version
from public.artist_scores ascore
join public.artists a on a.id=ascore.artist_id and a.is_active=true
order by ascore.artist_id, ascore.score_date desc, ascore.calculated_at desc;
